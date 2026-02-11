export function CelebrationIcon() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      {/* High-five hand gesture */}
      <g>
        {/* Palm */}
        <path
          d="M45 75 L35 85 L40 95 L55 90 L60 80 Z"
          fill="#2bee2b"
          opacity="0.2"
        />
        
        {/* Fingers */}
        <path
          d="M50 50 L48 70 L52 70 L54 50 Z"
          fill="#2bee2b"
          opacity="0.3"
        />
        <path
          d="M58 45 L56 68 L60 68 L62 45 Z"
          fill="#2bee2b"
          opacity="0.3"
        />
        <path
          d="M66 48 L64 70 L68 70 L70 48 Z"
          fill="#2bee2b"
          opacity="0.3"
        />
        <path
          d="M74 52 L72 72 L76 72 L78 52 Z"
          fill="#2bee2b"
          opacity="0.3"
        />
        
        {/* Thumb */}
        <path
          d="M42 65 L38 75 L42 78 L46 68 Z"
          fill="#2bee2b"
          opacity="0.3"
        />
        
        {/* Wrist/arm */}
        <path
          d="M40 85 L35 95 L45 100 L50 90 Z"
          fill="#2bee2b"
          opacity="0.15"
        />
      </g>
      
      {/* Green checkmark circle */}
      <circle
        cx="85"
        cy="35"
        r="22"
        fill="#2bee2b"
      />
      
      {/* Checkmark */}
      <path
        d="M77 35 L82 40 L93 29"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Celebration sparkles */}
      <circle cx="25" cy="30" r="2" fill="#2bee2b" opacity="0.6" />
      <circle cx="95" cy="65" r="2" fill="#2bee2b" opacity="0.6" />
      <circle cx="30" cy="50" r="1.5" fill="#2bee2b" opacity="0.4" />
      <circle cx="90" cy="80" r="1.5" fill="#2bee2b" opacity="0.4" />
      
      {/* Small stars */}
      <path
        d="M20 40 L21 42 L23 43 L21 44 L20 46 L19 44 L17 43 L19 42 Z"
        fill="#2bee2b"
        opacity="0.5"
      />
      <path
        d="M100 70 L101 72 L103 73 L101 74 L100 76 L99 74 L97 73 L99 72 Z"
        fill="#2bee2b"
        opacity="0.5"
      />
    </svg>
  );
}
