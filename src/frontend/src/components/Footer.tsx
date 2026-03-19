export default function Footer() {
  const year = new Date().getFullYear();
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;
  return (
    <footer className="border-t border-border mt-16 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-1">
        <p className="text-sm text-muted-foreground">
          © {year} VIIIth A BUDOS. Built with ❤️ using{" "}
          <a
            href={utmLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
        <p className="text-xs text-muted-foreground/50 font-mono">
          Version 1.0
        </p>
      </div>
    </footer>
  );
}
