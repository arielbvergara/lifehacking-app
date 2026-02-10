interface DividerProps {
  text: string;
}

export function Divider({ text }: DividerProps) {
  return (
    <div className="relative flex py-2 items-center">
      <div className="flex-grow border-t border-gray-200"></div>
      <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">
        {text}
      </span>
      <div className="flex-grow border-t border-gray-200"></div>
    </div>
  );
}
