"use client";

/**
 * @module ContactSection
 * @description Modul yang menampilkan bagian kontak dengan formulir dan informasi kontak
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import contactData from '@/data/contact.json';
import { Github, Linkedin, Twitter, Instagram, Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import { ThreadsIcon } from '@/components/social/threads-icon';
import { useViewportAnimation } from '@/hooks/use-viewport-animation';
import { toast } from 'sonner';

/**
 * @function ContactSection
 * @description Komponen yang menampilkan formulir kontak dan informasi kontak
 * @returns {JSX.Element} Komponen React yang merender bagian kontak
 */
export function ContactSection() {
  const { intro, form, contactInfo } = contactData;
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const { ref: headerRef, style: headerStyle } = useViewportAnimation<HTMLDivElement>({type: "slide-in-up", duration: 700});
  const { ref: formRef, style: formStyle } = useViewportAnimation<HTMLDivElement>({type: "slide-in-up", duration: 700});
  const { ref: infoRef, style: infoStyle } = useViewportAnimation<HTMLDivElement>({type: "slide-in-up", duration: 700});

  /**
 * @function handleSubmit
 * @description Menangani pengiriman formulir kontak
 * @param {React.FormEvent} e - Event formulir
 */
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details && Array.isArray(data.details)) {
          throw new Error(data.details.map((err: { message: string }) => err.message).join('\n'));
        }
        throw new Error(data.error || 'Gagal mengirim pesan');
      }

      toast.success('Pesan berhasil dikirim!');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan saat mengirim pesan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

/**
 * @function renderSocialIcon
 * @description Menampilkan ikon media sosial berdasarkan nama
 * @param {string} iconName - Nama ikon media sosial
 * @returns {JSX.Element | null} Komponen ikon atau null jika tidak ditemukan
 */
const renderSocialIcon = (iconName: string) => {
    switch (iconName) {
      case 'github':
        return <Github size={20} />;
      case 'linkedin':
        return <Linkedin size={20} />;
      case 'twitter':
        return <Twitter size={20} />;
      case 'instagram':
        return <Instagram size={20} />;
      case 'threads':
        return <ThreadsIcon size={20} />;
      default:
        return null;
    }
  };

  /**
 * @function renderContactIcon
 * @description Menampilkan ikon kontak berdasarkan tipe
 * @param {string} type - Tipe kontak (Email, Telepon, Lokasi)
 * @returns {JSX.Element | null} Komponen ikon atau null jika tidak ditemukan
 */
const renderContactIcon = (type: string) => {
    switch (type) {
      case 'Email':
        return <Mail size={20} />;
      case 'Telepon':
        return <Phone size={20} />;
      case 'Lokasi':
        return <MapPin size={20} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-8 py-8 max-w-4xl mx-auto">
      <div 
        ref={headerRef}
        className="text-center"
        style={headerStyle}
      >
        <h2 className="text-2xl font-bold mb-4">Contact</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">{intro}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card 
          ref={formRef}
          className="bg-gradient-to-br from-background to-primary/5 hover:shadow-lg hover:shadow-primary/5"
          style={formStyle}
        >
          <CardHeader>
            <CardTitle>{form.title}</CardTitle>
            <CardDescription>{form.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {form.fields.map((field, index) => (
                <div key={index} className="space-y-2">
                  <label htmlFor={field.id} className="text-sm font-medium">{field.label}</label>
                  {field.type === 'textarea' ? (
                    <Textarea 
                      id={field.id} 
                      placeholder={field.placeholder} 
                      rows={field.rows || 5}
                      autoComplete="off"
                      value={formData[field.id as keyof typeof formData] || ''}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <Input 
                      id={field.id} 
                      type={field.type} 
                      placeholder={field.placeholder}
                      autoComplete="off"
                      value={formData[field.id as keyof typeof formData] || ''}
                      onChange={handleInputChange}
                    />
                  )}
                </div>
              ))}

              <Button 
                type="submit" 
                className="w-full transition-all duration-300 hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  form.submitButton
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card 
          ref={infoRef}
          className="bg-gradient-to-br from-background to-primary/5 hover:shadow-lg hover:shadow-primary/5"
          style={infoStyle}
        >
          <CardHeader>
            <CardTitle>{contactInfo.title}</CardTitle>
            <CardDescription>{contactInfo.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {contactInfo.items.map((item, index) => {
              const icon = renderContactIcon(item.type);
              return (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start gap-2 bg-secondary group transition-all duration-300 hover:translate-x-1 px-4 py-8"
                  onClick={() => {
                    if (item.type.toLowerCase() === 'email') {
                      window.location.href = `mailto:${item.value}`;
                    } else if (item.type.toLowerCase() === 'phone') {
                      window.location.href = `tel:${item.value}`;
                    } else if (item.type.toLowerCase() === 'address') {
                      window.open(`https://maps.google.com/?q=${encodeURIComponent(item.value)}`, '_blank');
                    }
                  }}
                >
                  <span className="text-primary/70 group-hover:text-primary transition-colors duration-300">
                    {icon}
                  </span>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{item.type}</span>
                    <span className="text-muted-foreground text-sm">{item.value}</span>
                  </div>
                </Button>
              );
            })}
            <div className="pt-4 flex flex-col items-center">
              <h3 className="text-sm font-medium mb-3">Media Sosial</h3>
              <div className="flex gap-4">
                {contactInfo.socialMedia.map((social, index) => (
                  <a 
                    key={index}
                    href={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-2 rounded-full bg-secondary text-muted-foreground hover:text-primary hover:bg-secondary/80 transition-all duration-300"
                  >
                    {renderSocialIcon(social.icon)}
                  </a>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}