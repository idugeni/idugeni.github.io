"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NeonBorder } from "@/components/ui/neon-border";
import { useCSRFToken } from "@/components/providers/csrf-provider";
import { Send, User, MessageSquare } from "@/lib/icons";
import { toast } from "sonner";
import { createBlogComment } from "@/actions/blog";
import { format } from "date-fns";
import type { BlogComment } from "@/types/pages";

export function CommentSection({
  articleId,
  initialComments,
}: {
  articleId: string;
  initialComments: BlogComment[];
}) {
  const [formOpen, setFormOpen] = useState(false);
  const csrfToken = useCSRFToken();
  const [comments, setComments] = useState(initialComments);
  const [form, setForm] = useState({ nama: "", email: "", komentar: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createBlogComment({
        artikel_id: articleId,
        nama_komentator: form.nama,
        email_komentator: form.email,
        isi_komentar: form.komentar,
        csrf_token: csrfToken,
      });
      setForm({ nama: "", email: "", komentar: "" });
      toast.success("Komentar terkirim!", { description: "Akan tampil setelah disetujui." });
    } catch {
      toast.error("Gagal mengirim komentar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10">
      <button
        type="button"
        onClick={() => setFormOpen(!formOpen)}
        className="group mb-8 flex w-full items-center justify-between border border-primary/20 bg-card/50 p-4 transition-all duration-300 hover:border-primary/40 hover:bg-primary/5"
      >
        <span className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-primary" />
          <span className="font-orbitron font-bold text-foreground group-hover:text-primary transition-colors">
            {formOpen ? "TUTUP FORM" : "TULIS KOMENTAR"}
          </span>
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          {formOpen ? "▲" : "▼"}
        </span>
      </button>

      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          formOpen ? "max-h-[800px] opacity-100 mb-8" : "max-h-0 opacity-0"
        }`}
      >
        <NeonBorder>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <h3 className="font-orbitron font-bold text-lg mb-4">LEAVE_COMMENT</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="font-mono text-xs text-muted-foreground">NAMA</Label>
                <Input
                  required
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="bg-secondary/50 font-mono border-primary/30 rounded-none mt-1"
                  placeholder="Nama Anda"
                />
              </div>
              <div>
                <Label className="font-mono text-xs text-muted-foreground">EMAIL</Label>
                <Input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="bg-secondary/50 font-mono border-primary/30 rounded-none mt-1"
                  placeholder="email@example.com"
                />
              </div>
            </div>
            <div>
              <Label className="font-mono text-xs text-muted-foreground">KOMENTAR</Label>
              <textarea
                required
                value={form.komentar}
                onChange={(e) => setForm({ ...form, komentar: e.target.value })}
                className="w-full min-h-[100px] bg-secondary/50 font-mono text-sm border border-primary/30 rounded-none mt-1 p-3 resize-none focus:outline-none focus:border-primary"
                placeholder="Tulis komentar Anda..."
              />
            </div>
            <Button type="submit" className="font-mono bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
              <Send className="mr-2 h-4 w-4" />
              {loading ? "SENDING..." : "SUBMIT_COMMENT"}
            </Button>
          </form>
        </NeonBorder>
      </div>

      {comments.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-orbitron font-bold text-lg border-b border-primary/20 pb-2">
            COMMENTS ({comments.length})
          </h3>
          {comments.map((comment) => (
            <div key={comment.id} className="border border-border/50 bg-secondary/30 p-4 rounded-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <span className="font-mono text-sm font-bold text-foreground">{comment.namaKomentator}</span>
                  <span className="font-mono text-xs text-muted-foreground ml-3">
                    {comment.createdAt ? format(new Date(comment.createdAt), "dd MMM yyyy") : ""}
                  </span>
                </div>
              </div>
              <p className="font-mono text-sm text-muted-foreground pl-11">{comment.isiKomentar}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
