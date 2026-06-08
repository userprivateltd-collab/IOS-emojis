import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Smile, Users, Trees, Pizza, Activity, 
  Plane, Lightbulb, Hash, Flag, Menu, X, Check, 
  Info, Sparkles, ChevronRight, Type, Image as ImageIcon, Instagram
} from 'lucide-react';

const CATEGORIES = [
  { id: 'All', name: 'All Emojis', icon: Sparkles },
  { id: 'Smileys & Emotion', name: 'Smileys', icon: Smile },
  { id: 'People & Body', name: 'People', icon: Users },
  { id: 'Animals & Nature', name: 'Nature', icon: Trees },
  { id: 'Food & Drink', name: 'Food', icon: Pizza },
  { id: 'Activities', name: 'Activities', icon: Activity },
  { id: 'Travel & Places', name: 'Travel', icon: Plane },
  { id: 'Objects', name: 'Objects', icon: Lightbulb },
  { id: 'Symbols', name: 'Symbols', icon: Hash },
  { id: 'Flags', name: 'Flags', icon: Flag },
];

export default function App() {
  const [emojis, setEmojis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', img: null });
  const [showInfo, setShowInfo] = useState(true);
  const [visibleCount, setVisibleCount] = useState(120);
  const [selectedEmoji, setSelectedEmoji] = useState(null);

  useEffect(() => {
    const fetchEmojis = async () => {
      try {
        const response = await fetch('https://unpkg.com/emoji-datasource-apple/emoji.json');
        const data = await response.json();
        const supportedEmojis = data
          .filter(e => e.has_img_apple)
          .sort((a, b) => a.sort_order - b.sort_order);
        setEmojis(supportedEmojis);
      } catch (error) {
        console.error("Failed to load emojis:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmojis();
  }, []);

  const filteredEmojis = useMemo(() => {
    let filtered = emojis;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(emoji => {
        const matchName = emoji.name && emoji.name.toLowerCase().includes(query);
        const matchShortName = emoji.short_names && emoji.short_names.some(name => name.toLowerCase().includes(query));
        return matchName || matchShortName;
      });
    } else if (activeCategory !== 'All') {
      filtered = filtered.filter(emoji => emoji.category === activeCategory);
    }
    return filtered;
  }, [emojis, searchQuery, activeCategory]);

  const handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      setVisibleCount(prev => Math.min(prev + 100, filteredEmojis.length));
    }
  };

  useEffect(() => {
    setVisibleCount(120);
  }, [searchQuery, activeCategory]);

  const handleCopyText = (emoji) => {
    const codePoints = emoji.unified.split('-').map(u => '0x' + u);
    const actualEmojiChar = String.fromCodePoint(...codePoints);
    const imgUrl = `https://unpkg.com/emoji-datasource-apple/img/apple/64/${emoji.image}`;

    navigator.clipboard.writeText(actualEmojiChar).then(() => {
      showToast('Text copied to clipboard!', imgUrl);
      setSelectedEmoji(null);
    }).catch(() => {
      const pTextArea = document.createElement("textarea");
      pTextArea.value = actualEmojiChar;
      document.body.appendChild(pTextArea);
      pTextArea.focus();
      pTextArea.select();
      try {
        document.execCommand('copy');
        showToast('Text copied to clipboard!', imgUrl);
        setSelectedEmoji(null);
      } catch (e) {
        showToast('Failed to copy', null);
      }
      document.body.removeChild(pTextArea);
    });
  };

  const handleCopyImage = async (emoji) => {
    const imgUrl = `https://unpkg.com/emoji-datasource-apple/img/apple/64/${emoji.image}`;
    try {
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      showToast('Image copied to clipboard!', imgUrl);
      setSelectedEmoji(null);
    } catch (err) {
      showToast('Copying images directly isn\'t fully supported on your mobile browser. Copying text fallback...', imgUrl);
      setTimeout(() => handleCopyText(emoji), 1800);
    }
  };

  const showToast = (message, imgUrl) => {
    setToast({ show: true, message, img: imgUrl });
    setTimeout(() => setToast({ show: false, message: '', img: null }), 2500);
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col justify-between bg-white border-r border-slate-200">
      <div>
        <div className="h-16 flex items-center px-6 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2.5 text-slate-800 font-bold text-xl tracking-tight">
            <span className="bg-blue-600 text-white p-2 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Smile size={20} strokeWidth={2.5} />
            </span>
            <span>iOS Emojis</span>
          </div>
        </div>

        <div className="py-4 px-3 space-y-1">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Categories</p>
          <div className="space-y-1 max-h-[50vh] overflow-y-auto pr-1">
            {CATEGORIES.map(category => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id && !searchQuery;
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setActiveCategory(category.id);
                    setSearchQuery('');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                >
                  <Icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                  <span className="truncate">{category.name}</span>
                  {isActive && <ChevronRight size={14} className="ml-auto text-blue-600" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">About the Creator</p>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-700">
              <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shadow-sm">
                R
              </div>
              <span className="text-xs font-bold text-slate-800">Founded by Rajesh</span>
            </div>
            
            <a 
              href="https://instagram.com/notrazx" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 text-slate-500 hover:text-pink-600 transition-colors group"
            >
              <Instagram size={16} className="group-hover:scale-110 transition-transform text-slate-400 group-hover:text-pink-500" />
              <span className="text-xs font-semibold">@notrazx</span>
            </a>
            
            <div className="flex items-start gap-2 text-slate-500 pt-2 border-t border-slate-100">
              <Sparkles size={14} className="mt-0.5 text-amber-500 shrink-0" />
              <span className="text-[11px] font-medium leading-tight text-slate-600">
                Founder of<br/>
                <span className="text-amber-600 font-bold">Yellow Studios</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex text-slate-800 selection:bg-blue-100 overflow-hidden">
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <aside className="hidden lg:block w-64 h-screen shrink-0 sticky top-0">
        <SidebarContent />
      </aside>

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center px-4 lg:px-8 z-20 sticky top-0 shrink-0 gap-4">
          <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all">
            <Menu size={22} />
          </button>
          
          <div className="flex-1 max-w-2xl relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search emojis (e.g. laughing, fire, heart)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-100 border border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-2xl outline-none transition-all duration-200 text-sm font-medium placeholder-slate-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#F5F5F7]" onScroll={handleScroll}>
          <div className="max-w-7xl mx-auto p-4 lg:p-8">
            {showInfo && (
              <div className="mb-6 bg-blue-50/80 border border-blue-100 rounded-3xl p-4 flex gap-4 items-start shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600"></div>
                <div className="bg-blue-100/80 text-blue-600 p-2 rounded-2xl shrink-0">
                  <Info size={18} />
                </div>
                <div className="flex-1 pr-4">
                  <h3 className="font-bold text-blue-900 mb-0.5 text-sm">For Android Users</h3>
                  <p className="text-blue-800 text-xs leading-relaxed opacity-95">
                    Click any emoji to copy! It may look like standard Android emojis in normal messaging text boxes, but will render as authentic <b>iOS Emojis</b> when pasted directly inside supported media apps like <b>WhatsApp, TikTok, and Instagram</b>!
                  </p>
                </div>
                <button onClick={() => setShowInfo(false)} className="text-blue-400 hover:text-blue-600 p-1 rounded-lg hover:bg-blue-100/50">
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
                {searchQuery ? `Search results for "${searchQuery}"` : CATEGORIES.find(c => c.id === activeCategory)?.name}
              </h1>
              <span className="text-xs font-bold text-slate-500 bg-slate-200/60 px-3 py-1.5 rounded-full">
                {filteredEmojis.length} {filteredEmojis.length === 1 ? 'emoji' : 'emojis'}
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-3">
                <div className="w-9 h-9 border-[3.5px] border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 text-sm font-bold animate-pulse">Loading Apple Emojis...</p>
              </div>
            ) : filteredEmojis.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mb-3">
                  <Search size={26} className="text-slate-400" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">No emojis match your search</h3>
                <p className="text-slate-400 text-xs max-w-xs">Try searching for terms like "fire", "skull", or "laughing".</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3.5 pb-20">
                {filteredEmojis.slice(0, visibleCount).map((emoji) => (
                  <button
                    key={emoji.unified}
                    onClick={() => setSelectedEmoji(emoji)}
                    className="group flex flex-col items-center justify-center p-3 aspect-square bg-white border border-slate-200/50 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-400 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  >
                    <img
                      src={`https://unpkg.com/emoji-datasource-apple/img/apple/64/${emoji.image}`}
                      alt={emoji.name || 'emoji'}
                      loading="lazy"
                      className="w-11 h-11 drop-shadow-sm transition-all"
                    />
                  </button>
                ))}
              </div>
            )}
            
            {visibleCount < filteredEmojis.length && (
              <div className="py-8 text-center text-slate-400 text-xs font-semibold">Scroll to load more emojis...</div>
            )}
          </div>
        </main>
      </div>

      {selectedEmoji && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedEmoji(null)}></div>
          <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-xs overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-50/80 p-8 flex flex-col items-center justify-center border-b border-slate-100 relative">
              <button onClick={() => setSelectedEmoji(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-1.5 rounded-full transition-colors">
                <X size={18} />
              </button>
              <img src={`https://unpkg.com/emoji-datasource-apple/img/apple/64/${selectedEmoji.image}`} alt={selectedEmoji.name} className="w-20 h-20 drop-shadow-xl mb-3" />
              <h2 className="text-sm font-black text-slate-800 text-center uppercase tracking-wider">{selectedEmoji.short_name.replace(/_/g, ' ')}</h2>
            </div>
            <div className="p-5 space-y-2.5">
              <p className="text-[11px] text-center font-semibold text-slate-400 uppercase tracking-widest mb-2">Choose Copy Option</p>
              <button onClick={() => handleCopyText(selectedEmoji)} className="w-full flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-bold text-sm transition-colors shadow-lg shadow-blue-500/10">
                <Type size={18} /> Copy as Text
              </button>
              <button onClick={() => handleCopyImage(selectedEmoji)} className="w-full flex items-center justify-center gap-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-2xl font-bold text-sm transition-colors">
                <ImageIcon size={18} /> Copy as Image
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${toast.show ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95 pointer-events-none'}`}>
        <div className="bg-slate-900/95 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800">
          {toast.img && <img src={toast.img} alt="copied emoji" className="w-5 h-5" />}
          <span className="font-bold text-xs tracking-wide">{toast.message}</span>
        </div>
      </div>
    </div>
  );
}
