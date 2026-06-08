import { useState, useEffect } from 'react';
import data from 'emoji-datasource-apple';
import './index.css';

function App() {
  const [emojis, setEmojis] = useState([]);
  const [selectedEmoji, setSelectedEmoji] = useState(null);

  useEffect(() => {
    setEmojis(data.filter(e => e.has_img_apple));
  }, []);

  const copyToClipboard = async (type, emojiData) => {
    if (type === 'text') {
      const codePoints = emojiData.unified.split('-').map(u => '0x' + u);
      const char = String.fromCodePoint(...codePoints);
      await navigator.clipboard.writeText(char);
      alert("Emoji copied as text!");
    } else {
      const url = `https://unpkg.com/emoji-datasource-apple/img/apple/64/${emojiData.image}`;
      const response = await fetch(url);
      const blob = await response.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      alert("Emoji copied as image!");
    }
    setSelectedEmoji(null);
  };

  return (
    <div className="container">
      <header><h1>iOS Emoji Picker</h1></header>
      
      <div className="grid">
        {emojis.slice(0, 200).map(e => (
          <div key={e.unified} className="emoji-card" onClick={() => setSelectedEmoji(e)}>
            <img src={`https://unpkg.com/emoji-datasource-apple/img/apple/64/${e.image}`} alt={e.name} />
          </div>
        ))}
      </div>

      {selectedEmoji && (
        <div className="modal-overlay" onClick={() => setSelectedEmoji(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <img src={`https://unpkg.com/emoji-datasource-apple/img/apple/64/${selectedEmoji.image}`} alt="preview" />
            <button onClick={() => copyToClipboard('text', selectedEmoji)}>Copy as Text</button>
            <button className="secondary" onClick={() => copyToClipboard('image', selectedEmoji)}>Copy as Image</button>
          </div>
        </div>
      )}

      <footer>
        <h3>About</h3>
        <p>Founded by Rajesh | Yellow Studios</p>
        <a href="https://instagram.com/notrazx" target="_blank" rel="noreferrer">Instagram: @notrazx</a>
      </footer>
    </div>
  );
}
export default App;
