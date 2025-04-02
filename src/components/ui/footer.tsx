import { cn } from "@/lib/utils";
import { useViewportAnimation } from "@/hooks/use-viewport-animation";

const Footer = ({ className, ...props }: React.ComponentProps<"footer">) => {
  const currentYear = new Date().getFullYear();

  const { ref: footerRef, style: footerStyle } = useViewportAnimation<HTMLDivElement>({
    type: "fade-in",
    duration: 800
  });

  return (
    <footer
      className={cn(
        "w-full bg-background py-6",
        className
      )}
      {...props}
    >
      <div className="max-w-4xl mx-auto border-t">
        <div
          ref={footerRef}
          style={footerStyle}
          className="flex items-center justify-center py-6"
        >
          <p className="text-sm text-muted-foreground">
            © {currentYear} Idugeni. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;