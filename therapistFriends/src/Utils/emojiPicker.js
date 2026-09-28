import React, { useState, useRef, useEffect } from 'react';
import './emojiPicker.css';

const EmojiPicker = ({ onEmojiSelect, position = 'bottom-start' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);

  // Lista de emojis categorizados
  const emojiCategories = {
    felizes: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', 
      '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '☺️', '😚', '😙', '🥲', 
      '😋', '😛', '😜', '😝', '🤑', '🤗', '🤭', '🤪', '😺', '😸', '😹', 
      '😻', '😼', '😽', '🙈', '🙉', '🙊', '💋', '💌'
    ],
    tristes: [
      '🥺', '😓', '😔', '😕', '🙁', '☹️', '😖', '😞', '😟', '😤', '😢', 
      '😭', '😦', '😧', '😨', '😩', '🤯', '😬', '😰', '😥', '😪', '😫', 
      '🥱', '😴', '😮', '😯', '😲', '🥴', '😵', '🤐', '🤕', '🤒', '😷', 
      '🥶', '🥵', '😶', '😶‍🌫️', '💀', '☠️', '😿', '😾'
    ],
    surpresas: [
      '😳', '😱', '😵‍💫', '🥸', '😏', '😒', '😌', '😑', '😭', '🤨', '🧐', 
      '🤓', '😎', '🥳', '🤡', '👻', '💩', '😺', '👽', '👾', '🤖', '🎃', 
      '😻', '❣️', '❤️‍🔥', '❤️‍🩹', '💔', '💘', '💝', '💖', '💗', '💓', '💞', 
      '💕', '💟', '❣️', '💌'
    ],
    amedrontados: [
      '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', 
      '😫', '🥺', '😿', '🙀', '😾', '💣', '🔪', '🗡️', '⚔️', '🛡️', '💊', 
      '💉', '🦠', '🧬', '🧫', '🧪', '🌡️', '⚰️', '🪦', '🚬', '⚱️', '🧭'
    ],
    neutros: [
      '😐', '😑', '😶', '😶‍🌫️', '🙄', '😯', '😦', '😧', '🤔', '🤫', '🤥', 
      '😬', '🫢', '🫣', '🫠', '🫡', '🤤', '😴', '😪', '🥱', '🛌', '🛏️', 
      '🧑‍💻', '👨‍💻', '👩‍💻', '🧑‍🎓', '👨‍🎓', '👩‍🎓', '🧑‍🏫', '👨‍🏫', '👩‍🏫', '🧑‍🏭'
    ],
    positivos: [
      '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', 
      '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤙', '💪', '🦾', '🦿', 
      '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀'
    ],
    animais: [
      '🐵', '🐒', '🦍', '🦧', '🐶', '🐕', '🦮', '🐕‍🦺', '🐩', '🐺', '🦊', 
      '🦝', '🐱', '🐈', '🐈‍⬛', '🦁', '🐯', '🐅', '🐆', '🐴', '🐎', '🦄', 
      '🦓', '🦌', '🐮', '🐂', '🐃', '🐄', '🐷', '🐖', '🐗', '🐽', '🐏'
    ],
    natureza: [
      '🌱', '🌲', '🌳', '🌴', '🌵', '🌷', '🌸', '🌹', '🌺', '🌻', '🌼', 
      '💐', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🪴', '🍄', '🌰', 
      '🎄', '🌴', '🌱', '🌿', '🍃', '🍂', '🍁', '🍄', '🌷', '🌹', '🥀'
    ],
    objetos: [
      '⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', 
      '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', 
      '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️'
    ],
    simbolos: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', 
      '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', 
      '🕉', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉'
    ],
    alimentos: [
      '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', 
      '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', 
      '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐'
    ]
  };

  // Fechar o seletor ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEmojiClick = (emoji) => {
    onEmojiSelect(emoji);
    setIsOpen(false);
  };

  // Determina a classe de posicionamento baseada na prop
  const getPositionClass = () => {
    const positions = {
      'top': 'top',
      'top-start': 'top left',
      'top-end': 'top right',
      'top-center': 'top center',
      'bottom': 'bottom',
      'bottom-start': 'bottom left',
      'bottom-end': 'bottom right',
      'bottom-center': 'bottom center',
      'left': 'left',
      'left-start': 'left top',
      'left-end': 'left bottom',
      'left-center': 'left center',
      'right': 'right',
      'right-start': 'right top',
      'right-end': 'right bottom',
      'right-center': 'right center'
    };
    
    return positions[position] || 'bottom left';
  };

  return (
    <div className="emoji-picker-container" ref={pickerRef}>
      <button 
        type='button'
        className="emoji-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Selecionar emoji"
      >
        😊
      </button>
      
      {isOpen && (
        <div className={`emoji-picker ${getPositionClass()}`}>
          <div className="emoji-picker-header">
            <h3>Selecione um emoji</h3>
          </div>
          
          <div className="emoji-categories">
            {Object.entries(emojiCategories).map(([category, emojis]) => (
              <div key={category} className="emoji-category">
                <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                <div className="emoji-grid">
                  {emojis.map((emoji, index) => (
                    <button
                      key={index}
                      className="emoji-btn"
                      onClick={() => handleEmojiClick(emoji)}
                      aria-label={`Emoji ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmojiPicker;