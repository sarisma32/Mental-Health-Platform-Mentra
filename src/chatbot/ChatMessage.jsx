import { Link } from 'react-router-dom';

/**
 * Parses a line of text and converts:
 * - **bold** → <strong>
 * - [link text](/path) → <Link> (internal) or <a> (external)
 */
const parseLine = (line, lineIdx, isBot) => {
  // Split by markdown links [text](url) and bold **text**
  const tokens = line.split(/(\[.*?\]\(.*?\)|\*\*.*?\*\*)/g);

  return tokens.map((token, i) => {
    // Markdown link: [text](url)
    const linkMatch = token.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      const [, text, url] = linkMatch;
      const isExternal = url.startsWith('http');
      return isExternal ? (
        <a key={i} href={url} target="_blank" rel="noopener noreferrer"
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold mt-1 mr-1 transition-colors ${
            isBot
              ? 'bg-[#A3B18A] text-white hover:bg-[#8FA076]'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}>
          {text} →
        </a>
      ) : (
        <Link key={i} to={url}
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold mt-1 mr-1 transition-colors ${
            isBot
              ? 'bg-[#A3B18A] text-white hover:bg-[#8FA076]'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}>
          {text} →
        </Link>
      );
    }

    // Bold: **text**
    const boldMatch = token.match(/^\*\*(.*?)\*\*$/);
    if (boldMatch) {
      return <strong key={i} className="font-semibold">{boldMatch[1]}</strong>;
    }

    return <span key={i}>{token}</span>;
  });
};

export const parseText = (text, isBot = true) => {
  return text.split('\n').map((line, lineIdx, arr) => (
    <span key={lineIdx}>
      {parseLine(line, lineIdx, isBot)}
      {lineIdx < arr.length - 1 && <br />}
    </span>
  ));
};

const ChatMessage = ({ message, formatTime }) => {
  const isBot = message.from === 'bot';

  return (
    <div className={`flex items-end gap-2 ${isBot ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      {isBot && (
        <div className="w-7 h-7 bg-[#A3B18A] rounded-full flex items-center justify-center flex-shrink-0 mb-1">
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
      )}

      <div className={`max-w-[80%] ${isBot ? '' : 'items-end flex flex-col'}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isBot
            ? 'bg-white text-gray-700 rounded-bl-sm'
            : 'bg-[#A3B18A] text-white rounded-br-sm'
        }`}>
          {parseText(message.text, isBot)}
        </div>
        <p className="text-xs text-gray-400 mt-1 px-1">{formatTime(message.time)}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
