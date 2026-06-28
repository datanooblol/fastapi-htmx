interface TagProps {
  label: string;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
}

export function Tag({ label, onRemove, onClick, className = "" }: TagProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded-sm
        bg-tag-bg text-sb-primary text-caption
        ${onClick ? "cursor-pointer hover:brightness-110" : ""}
        ${className}
      `}
      onClick={onClick}
    >
      {label}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="text-text-muted hover:text-sb-danger text-xs cursor-pointer bg-transparent border-none p-0"
        >
          ✕
        </button>
      )}
    </span>
  );
}
