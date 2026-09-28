import React, { useRef, useEffect, useState } from 'react';

let lastFocusedTarget = null;

if (typeof window !== 'undefined') {
  document.addEventListener('focusin', (e) => {
    const el = e.target;
    if (el && (el.isContentEditable || el.getAttribute?.('contenteditable') === 'true')) {
      lastFocusedTarget = el;
    }
  }, true);
}

/**
 * Sticky Header Toolbar Component for Admin Pages
 * Placed at the top header position of admin pages to control formatting
 * for whichever contentEditable text field (RichTextEditor, RichInput) is currently focused or selected.
 */
export function RichTextToolbar() {
  const handleExecute = (command, valueArg = null) => {
    const sel = window.getSelection();
    let target = null;

    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      let container = range.commonAncestorContainer;
      if (container.nodeType !== 1) container = container.parentElement;
      if (container) {
        target = container.isContentEditable ? container : container.closest?.('[contenteditable="true"]');
      }
    }

    if (!target) {
      target = document.activeElement;
      if (!target || target === document.body || target.tagName === 'BUTTON') {
        target = lastFocusedTarget;
      }
    }

    if (!target || !document.body.contains(target)) return;

    if (target.isContentEditable || target.getAttribute?.('contenteditable') === 'true') {
      if (document.activeElement !== target && !target.contains(document.activeElement)) {
        target.focus();
      }

      try {
        document.execCommand('styleWithCSS', false, false);
      } catch (e) {}

      if (command === 'removeFormat') {
        document.execCommand('removeFormat', false, null);
        document.execCommand('formatBlock', false, '<p>');
      } else if (command === 'insertLineGap') {
        document.execCommand('insertHTML', false, '<br><br>');
      } else {
        document.execCommand(command, false, valueArg);
      }

      const event = new Event('input', { bubbles: true });
      target.dispatchEvent(event);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        if (key === 'b') {
          e.preventDefault();
          handleExecute('bold');
        } else if (key === 'i') {
          e.preventDefault();
          handleExecute('italic');
        } else if (key === 'u') {
          e.preventDefault();
          handleExecute('underline');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  return (
    <div style={{
      position: 'sticky',
      top: '12px',
      zIndex: 1000,
      background: '#ffffff',
      border: '1.5px solid #2563eb',
      borderRadius: '14px',
      padding: '10px 16px',
      boxShadow: '0 8px 24px rgba(37, 99, 235, 0.15)',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '6px',
      marginBottom: '24px',
      userSelect: 'none'
    }}>
      <style>{`
        div[contenteditable]:empty:before,
        .modern-input[contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
          display: block;
        }
      `}</style>
      <span style={{ fontSize: '12px', fontWeight: 800, color: '#1a56db', marginRight: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        ⚡ Text Formatting Header Toolbar:
      </span>

      {/* TEXT STYLES */}
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); handleExecute('bold'); }}
        title="Bold (Ctrl+B)"
        style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
      >
        <b>B</b>
      </button>
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); handleExecute('italic'); }}
        title="Italic (Ctrl+I)"
        style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontStyle: 'italic', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
      >
        <i>I</i>
      </button>
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); handleExecute('underline'); }}
        title="Underline (Ctrl+U)"
        style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', textDecoration: 'underline', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
      >
        <u>U</u>
      </button>
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); handleExecute('strikeThrough'); }}
        title="Strikethrough"
        style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', textDecoration: 'line-through', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
      >
        <s>S</s>
      </button>

      <div style={{ width: '1px', height: '22px', background: '#cbd5e1', margin: '0 4px' }} />

      {/* ALIGNMENTS */}
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); handleExecute('justifyLeft'); }}
        title="Align Left"
        style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
      >
        Left
      </button>
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); handleExecute('justifyCenter'); }}
        title="Align Center"
        style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
      >
        Center
      </button>
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); handleExecute('justifyRight'); }}
        title="Align Right"
        style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
      >
        Right
      </button>
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); handleExecute('justifyFull'); }}
        title="Justify Text"
        style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
      >
        Justify
      </button>

      <div style={{ width: '1px', height: '22px', background: '#cbd5e1', margin: '0 4px' }} />

      {/* LISTS */}
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); handleExecute('insertUnorderedList'); }}
        title="Bullet List"
        style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
      >
        • Bullet List
      </button>
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); handleExecute('insertOrderedList'); }}
        title="Numbered List"
        style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
      >
        1. Numbered List
      </button>

      <div style={{ width: '1px', height: '22px', background: '#cbd5e1', margin: '0 4px' }} />

      {/* HEADINGS */}
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); handleExecute('formatBlock', '<h3>'); }}
        title="Heading H3"
        style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}
      >
        H3
      </button>
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); handleExecute('formatBlock', '<p>'); }}
        title="Paragraph"
        style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
      >
        Paragraph
      </button>
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); handleExecute('insertLineGap'); }}
        title="New Line / Gap"
        style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
      >
        Line Gap
      </button>

      <div style={{ width: '1px', height: '22px', background: '#cbd5e1', margin: '0 4px' }} />

      {/* CLEAR */}
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); handleExecute('removeFormat'); }}
        title="Clear Formatting"
        style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #ef4444', background: '#fef2f2', color: '#ef4444', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
      >
        🧹 Clear Formatting
      </button>
    </div>
  );
}

/**
 * Single-line or compact rich text input field
 * Replaces standard HTML <input> elements so rich text styles (Bold, H3, Italic)
 * apply INSTANTLY and VISUALLY without displaying raw HTML code tags.
 */
export function RichInput({ value = '', onChange, placeholder = '', className = '', style = {} }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      const isFocused = document.activeElement === ref.current || ref.current.contains(document.activeElement);
      if (!isFocused && ref.current.innerHTML !== (value || '')) {
        ref.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const handleInput = () => {
    if (ref.current) {
      onChange(ref.current.innerHTML);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div
      ref={ref}
      contentEditable
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      data-placeholder={placeholder}
      className={`modern-input ${className}`}
      style={{
        minHeight: '42px',
        lineHeight: '1.5',
        outline: 'none',
        wordBreak: 'break-word',
        boxSizing: 'border-box',
        background: '#ffffff',
        ...style
      }}
    />
  );
}

export default function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Type text here...',
  minHeight = '120px',
  showInlineToolbar = false
}) {
  const editorRef = useRef(null);
  const [isCodeView, setIsCodeView] = useState(false);
  const [codeValue, setCodeValue] = useState(value || '');

  useEffect(() => {
    if (editorRef.current && !isCodeView) {
      const isFocused = document.activeElement === editorRef.current || editorRef.current.contains(document.activeElement);
      if (!isFocused && editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
    setCodeValue(value || '');
  }, [value, isCodeView]);

  const handleExecute = (command, valueArg = null) => {
    document.execCommand(command, false, valueArg);
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
    }
  };

  const handleCodeChange = (e) => {
    const val = e.target.value;
    setCodeValue(val);
    onChange(val);
  };

  const toggleCodeView = () => {
    if (!isCodeView) {
      if (editorRef.current) {
        setCodeValue(editorRef.current.innerHTML);
      }
    } else {
      if (editorRef.current) {
        editorRef.current.innerHTML = codeValue;
      }
    }
    setIsCodeView(!isCodeView);
  };

  return (
    <div style={{
      border: '1.5px solid #cbd5e1',
      borderRadius: '12px',
      overflow: 'hidden',
      background: '#ffffff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
    }}>
      {/* INLINE TOOLBAR (ONLY RENDERED IF showInlineToolbar IS EXPLICITLY TRUE) */}
      {showInlineToolbar && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '4px',
          padding: '8px 12px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          userSelect: 'none'
        }}>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); handleExecute('bold'); }}
            title="Bold"
            style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
          >
            <b>B</b>
          </button>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); handleExecute('italic'); }}
            title="Italic"
            style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', fontStyle: 'italic', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
          >
            <i>I</i>
          </button>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); handleExecute('underline'); }}
            title="Underline"
            style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', textDecoration: 'underline', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
          >
            <u>U</u>
          </button>

          <button
            type="button"
            onClick={toggleCodeView}
            title={isCodeView ? 'Switch to Visual Editor' : 'Switch to HTML Code Mode'}
            style={{
              marginLeft: 'auto',
              padding: '4px 10px',
              borderRadius: '6px',
              border: '1px solid #2563eb',
              background: isCodeView ? '#2563eb' : '#eff6ff',
              color: isCodeView ? '#ffffff' : '#2563eb',
              fontWeight: 800,
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            {isCodeView ? '👁️ Visual Editor' : 'HTML Code'}
          </button>
        </div>
      )}

      {/* EDITOR AREA */}
      {isCodeView ? (
        <textarea
          value={codeValue}
          onChange={handleCodeChange}
          style={{
            width: '100%',
            minHeight,
            padding: '14px',
            fontFamily: 'monospace',
            fontSize: '13px',
            border: 'none',
            outline: 'none',
            resize: 'vertical',
            boxSizing: 'border-box',
            background: '#1e293b',
            color: '#38bdf8'
          }}
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          data-placeholder={placeholder}
          style={{
            width: '100%',
            minHeight,
            padding: '14px',
            outline: 'none',
            fontSize: '14px',
            lineHeight: 1.7,
            color: '#1e293b',
            fontFamily: '"Hind Siliguri", sans-serif',
            boxSizing: 'border-box',
            overflowY: 'auto'
          }}
        />
      )}
    </div>
  );
}
