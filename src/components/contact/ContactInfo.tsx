import React from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin } from 'lucide-react';
import { SocialIcons } from '@/components/social/SocialIcons';

interface ContactInfoProps {
  contactInfo: {
    title: string;
    description: string;
    items: Array<{ type: string; value: string }>;
    socialMedia: Array<{ icon: string; url: string }>;
  };
}

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

const ContactInfo: React.FC<ContactInfoProps> = ({ contactInfo }) => {
  return (
    <div className="bg-background/80 backdrop-blur-sm border border-border rounded-lg hover:shadow-lg hover:shadow-primary/5">
      <div className="p-6">
        <h3 className="text-lg font-bold mb-2">{contactInfo.title}</h3>
        <p className="text-muted-foreground mb-4">{contactInfo.description}</p>
        <div className="space-y-4">
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
                  className="p-2 rounded-full bg-primary/10 text-primary hover:text-primary-foreground hover:bg-primary transition-all duration-300"
                >
                  <SocialIcons iconName={social.icon} size={20} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;