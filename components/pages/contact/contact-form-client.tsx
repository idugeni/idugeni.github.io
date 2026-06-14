"use client";

import { useState, useRef } from "react";
import { useSendContactMessage } from "@/actions/hooks/use-contact";
import { useCSRFToken } from "@/components/providers/csrf-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NeonBorder } from "@/components/ui/neon-border";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { toast } from "sonner";
import {
  HiOutlineCheckCircle,
  HiOutlinePaperAirplane,
} from "react-icons/hi2";

const emptyContactForm = {
  nama: "",
  email: "",
  subjek: "",
  pesan: "",
  noWa: "",
};

interface FileAttachment {
  file: File;
  preview: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
  url?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

export function ContactFormClient() {
  const sendMessage = useSendContactMessage();
  const csrfToken = useCSRFToken();

  const [formData, setFormData] = useState(emptyContactForm);
  const [sent, setSent] = useState(false);
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubjectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (value === "custom") {
      setIsCustomSubject(true);
      setFormData((current) => ({ ...current, subjek: "" }));
      return;
    }

    setIsCustomSubject(false);
    setFormData((current) => ({ ...current, subjek: value }));
  };

  const resetForm = () => {
    setFormData(emptyContactForm);
    setIsCustomSubject(false);
    setAttachments([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newAttachments: FileAttachment[] = [];

    Array.from(files).forEach((file) => {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File "${file.name}" exceeds 10MB limit`);
        return;
      }

      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`File type "${file.type}" is not allowed`);
        return;
      }

      // Create preview for images
      const preview = file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : "";

      newAttachments.push({
        file,
        preview,
        uploading: false,
        uploaded: false,
      });
    });

    // Limit to 5 files max
    const totalFiles = attachments.length + newAttachments.length;
    if (totalFiles > 5) {
      toast.error("Maximum 5 files allowed");
      return;
    }

    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const removeAttachment = (index: number) => {
    const attachment = attachments[index];
    if (attachment.preview) {
      URL.revokeObjectURL(attachment.preview);
    }
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Upload attachments if any
    const uploadedAttachments: Array<{
      url: string;
      filename: string;
      size: number;
      type: string;
    }> = [];

    if (attachments.length > 0) {
      try {
        for (let i = 0; i < attachments.length; i++) {
          setAttachments((prev) =>
            prev.map((att, idx) => (idx === i ? { ...att, uploading: true } : att))
          );

          const formDataUpload = new FormData();
          formDataUpload.append("file", attachments[i].file);

          const response = await fetch("/api/upload-contact-attachment", {
            method: "POST",
            body: formDataUpload,
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Upload failed");
          }

          const result = await response.json();
          uploadedAttachments.push(result.data);

          setAttachments((prev) =>
            prev.map((att, idx) =>
              idx === i ? { ...att, uploading: false, uploaded: true, url: result.data.url } : att
            )
          );
        }
      } catch (error) {
        toast.error("Failed to upload attachments", {
          description: error instanceof Error ? error.message : "Please try again",
        });
        setAttachments((prev) => prev.map((att) => ({ ...att, uploading: false })));
        return;
      }
    }

    // Submit form with attachments
    const result = await sendMessage.execute({
      ...formData,
      attachments: uploadedAttachments,
    });

    if (!result) return;

    const emailStatus = result.email?.adminNotification;
    toast.success("TRANSMISSION_SUCCESSFUL", {
      description:
        emailStatus === "sent"
          ? "Pesan Anda telah diterima dan notifikasi email berhasil dikirim."
          : "Pesan Anda telah diterima. Saya akan merespons dalam 24 jam.",
    });
    resetForm();
    setSent(true);
  };

  return (
    <ScrollReveal delay={100}>
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 blur-sm opacity-50" />
        <div className="relative bg-background border border-primary/20 p-6 md:p-8">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/50" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/50" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/50" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/50" />

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded bg-primary/10 border border-primary/30 flex items-center justify-center">
              <HiOutlinePaperAirplane className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-orbitron font-bold text-lg text-foreground">
                TRANSMIT_MESSAGE
              </h2>
              <p className="font-mono text-[10px] text-muted-foreground">
                Semua field bertanda * wajib diisi
              </p>
            </div>
          </div>

          {sent ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                <HiOutlineCheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-orbitron font-bold text-lg text-primary mb-2">
                TRANSMISSION_COMPLETE
              </h3>
              <p className="font-mono text-sm text-muted-foreground mb-6">
                Pesan Anda telah diterima. Saya akan merespons segera.
              </p>
              <Button
                variant="outline"
                className="font-mono border-primary/50"
                onClick={() => {
                  setSent(false);
                  resetForm();
                }}
              >
                SEND_ANOTHER
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* CSRF Token Hidden Field */}
              <input type="hidden" name="csrf_token" value={csrfToken} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="font-mono text-[10px] text-muted-foreground tracking-wider">
                    NAMA *
                  </Label>
                  <Input
                    required
                    placeholder="Nama lengkap Anda"
                    className="bg-secondary/30 border-border/50 focus:border-primary font-mono text-sm rounded-none h-11"
                    value={formData.nama}
                    onChange={(event) =>
                      setFormData({ ...formData, nama: event.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-[10px] text-muted-foreground tracking-wider">
                    EMAIL *
                  </Label>
                  <Input
                    required
                    type="email"
                    placeholder="email@example.com"
                    className="bg-secondary/30 border-border/50 focus:border-primary font-mono text-sm rounded-none h-11"
                    value={formData.email}
                    onChange={(event) =>
                      setFormData({ ...formData, email: event.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="font-mono text-[10px] text-muted-foreground tracking-wider">
                    SUBJEK *
                  </Label>
                  <select
                    required
                    className="w-full bg-secondary/30 border border-border/50 focus:border-primary font-mono text-sm rounded-none h-11 px-3 text-foreground focus:outline-none focus:ring-0 focus-visible:ring-0 cursor-pointer"
                    value={isCustomSubject ? "custom" : formData.subjek}
                    onChange={handleSubjectChange}
                  >
                    <option value="" disabled className="bg-background text-muted-foreground">Pilih Subjek Transmisi...</option>
                    <option value="Jasa Pembuatan Website / Aplikasi" className="bg-background text-foreground">Website / Web App Development</option>
                    <option value="Konsultasi & Arsitektur Cloud" className="bg-background text-foreground">Consulting & Cloud Architecture</option>
                    <option value="Optimasi Performa & SecOps Hardening" className="bg-background text-foreground">Performance & SecOps Hardening</option>
                    <option value="Kolaborasi / Project Partnership" className="bg-background text-foreground">Project Collaboration / Partnership</option>
                    <option value="custom" className="bg-background text-primary font-bold">Lainnya (Ketik Manual...)</option>
                  </select>
                  {isCustomSubject && (
                    <Input
                      required
                      placeholder="Ketik subjek kustom Anda disini..."
                      className="bg-secondary/30 border-border/50 focus:border-primary font-mono text-sm rounded-none h-11 mt-2 animate-in slide-in-from-top-1 duration-200"
                      value={formData.subjek}
                      onChange={(event) =>
                        setFormData({ ...formData, subjek: event.target.value })
                      }
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-[10px] text-muted-foreground tracking-wider">
                    WHATSAPP (opsional)
                  </Label>
                  <Input
                    placeholder="+62 812 xxxx xxxx"
                    className="bg-secondary/30 border-border/50 focus:border-primary font-mono text-sm rounded-none h-11"
                    value={formData.noWa}
                    onChange={(event) =>
                      setFormData({ ...formData, noWa: event.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-[10px] text-muted-foreground tracking-wider">
                  PESAN *
                </Label>
                <textarea
                  required
                  placeholder="Ceritakan tentang proyek atau kebutuhan Anda..."
                  className="w-full min-h-[160px] bg-secondary/30 border border-border/50 focus:border-primary font-mono text-sm rounded-none p-3 resize-none focus:outline-none focus:ring-0 text-foreground placeholder:text-muted-foreground/50"
                  value={formData.pesan}
                  onChange={(event) =>
                    setFormData({ ...formData, pesan: event.target.value })
                  }
                />
              </div>

              {/* File Attachments Section */}
              <div className="space-y-3">
                <Label className="font-mono text-[10px] text-muted-foreground tracking-wider">
                  ATTACHMENTS (opsional)
                </Label>
                
                {/* Drag and Drop Zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleFileSelect(e.dataTransfer.files);
                  }}
                  className="border-2 border-dashed border-border/50 hover:border-primary/50 rounded-none p-6 text-center cursor-pointer transition-colors bg-secondary/20 hover:bg-secondary/30"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={ALLOWED_TYPES.join(",")}
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                  />
                  <div className="space-y-2">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-mono text-sm text-foreground">
                        Drop files here or click to browse
                      </p>
                      <p className="font-mono text-xs text-muted-foreground mt-1">
                        Max 5 files, 10MB each (Images, PDF, DOC, TXT)
                      </p>
                    </div>
                  </div>
                </div>

                {/* File List */}
                {attachments.length > 0 && (
                  <div className="space-y-2">
                    {attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-secondary/30 border border-border/50 rounded-none"
                      >
                        {/* Preview or Icon */}
                        {attachment.preview ? (
                          <img
                            src={attachment.preview}
                            alt={attachment.file.name}
                            className="w-12 h-12 object-cover border border-border/50"
                          />
                        ) : (
                          <div className="w-12 h-12 flex items-center justify-center bg-primary/10 border border-primary/30">
                            <svg
                              className="w-6 h-6 text-primary"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                        )}

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-sm text-foreground truncate">
                            {attachment.file.name}
                          </p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {(attachment.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-2">
                          {attachment.uploading && (
                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          )}
                          {attachment.uploaded && (
                            <svg
                              className="w-5 h-5 text-green-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            disabled={attachment.uploading}
                            className="p-1 hover:bg-destructive/10 rounded transition-colors disabled:opacity-50"
                          >
                            <svg
                              className="w-5 h-5 text-destructive"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full font-mono bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-none shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-shadow"
                disabled={sendMessage.isLoading || attachments.some((a) => a.uploading)}
              >
                {sendMessage.isLoading ? (
                  "TRANSMITTING..."
                ) : (
                  <>
                    <HiOutlinePaperAirplane className="w-4 h-4 mr-2" />
                    EXECUTE_TRANSMISSION
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </ScrollReveal>
  );
}
