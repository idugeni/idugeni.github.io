"Use Client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import ReCaptchaWidget from './ReCaptchaWidget';

interface ContactFormProps {
  form: {
    title: string;
    description: string;
    fields: Array<{ id: string; label: string; type: string; placeholder: string; rows?: number }>;
    submitButton: string;
  };
}

const ContactForm: React.FC<ContactFormProps> = ({ form }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi form sebelum memeriksa CAPTCHA
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Mohon lengkapi semua field yang diperlukan.");
      return;
    }

    if (!recaptchaToken) {
      toast.error("Mohon verifikasi bahwa Anda bukan robot dengan menyelesaikan CAPTCHA.");
      return;
    }

    setIsLoading(true);
  
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          'g-recaptcha-response': recaptchaToken
        }),
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
      setRecaptchaToken('');
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



  return (
    <div className="bg-background/80 backdrop-blur-sm border border-border rounded-lg hover:shadow-lg hover:shadow-primary/5">
      <div className="p-6">
        <h3 className="text-lg font-bold mb-2">{form.title}</h3>
        <p className="text-muted-foreground mb-4">{form.description}</p>
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
          <div className="flex justify-center">
            <ReCaptchaWidget onVerify={setRecaptchaToken} />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : form.submitButton}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;