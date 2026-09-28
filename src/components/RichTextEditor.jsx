import React, { useRef, useEffect, useState } from 'react';

let lastFocusedTarget = null;

if (typeof window !== 'undefined') {
  document.addEventListener('focusin', (e) => {
    const el = e.target;
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable || el.getAttribute?.('contenteditable') === 'true')) {
      lastFocusedTarget = el;
    }
  }, true);
}

function setNativeInputValue(element, value) {
  const prototype = Object.getPrototypeOf(element);
  const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
  if (descriptor && descriptor.set) {
    descriptor.set.call(element, value);
  } else {
    element.value = value;
  }
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

/**
 * Sticky Header Toolbar Component for Admin Pages
 * Placed at the top header position of admin pages to control formatting
 * for whichever text field (contentEditable, input, textarea) is currently focused or selected.
 */
export function RichTextToolbar() {
  const handleExecute = (command, valueArg = null) => {
    let target = document.activeElement;
    if (!target || target === document.body || target.tagName === 'BUTTON') {
      target = lastFocusedTarget;
    }

    if (!target || !document.body.contains(target)) return;

    // 1. ContentEditable elements (RichTextEditor)
    if (target.isContentEditable || target.getAttribute?.('contenteditable') === 'true') {
      target.focus();
      document.execCommand(command, false, valueArg);
      const event = new Event('input', { bubbles: true });
      target.dispatchEvent(event);
      return;
    }

    // 2. Native HTML <input> and <textarea> elements
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      target.focus();
      const start = target.selectionStart ?? 0;
      const end = target.selectionEnd ?? 0;
      const currentVal = target.value || '';
      const selectedText = currentVal.substring(start, end);

      const wrapTag = (openTag, closeTag) => {
        if (!selectedText) {
          return openTag + closeTag;
        }
        const trimmed = selectedText.trim();
        if (trimmed.startsWith(openTag) && trimmed.endsWith(closeTag)) {
          return trimmed.substring(openTag.length, trimmed.length - closeTag.length);
        }
        return `${openTag}${selectedText}${closeTag}`;
      };

      let replacement = selectedText;

      switch (command) {
        case 'bold':
          replacement = wrapTag('<b>', '</b>');
          break;
        case 'italic':
          replacement = wrapTag('<i>', '</i>');
          break;
        case 'underline':
          replacement = wrapTag('<u>', '</u>');
          break;
        case 'strikeThrough':
          replacement = wrapTag('<s>', '</s>');
          break;
        case 'justifyLeft':
          replacement = wrapTag('<div style="text-align:left">', '</div>');
          break;
        case 'justifyCenter':
          replacement = wrapTag('<div style="text-align:center">', '</div>');
          break;
        case 'justifyRight':
          replacement = wrapTag('<div style="text-align:right">', '</div>');
          break;
        case 'justifyFull':
          replacement = wrapTag('<div style="text-align:justify">', '</div>');
          break;
        case 'insertUnorderedList':
          if (selectedText) {
            const lines = selectedText.split('\n');
            replacement = '<ul>' + lines.map(l => `<li>${l}</li>`).join('') + '</ul>';
          } else {
            replacement = '<ul><li></li></ul>';
          }
          break;
        case 'insertOrderedList':
          if (selectedText) {
            const lines = selectedText.split('\n');
            replacement = '<ol>' + lines.map(l => `<li>${l}</li>`).join('') + '</ol>';
          } else {
            replacement = '<ol><li></li></ol>';
          }
          break;
        case 'formatBlock':
          if (valueArg === '<h3>') replacement = wrapTag('<h3>', '</h3>');
          else if (valueArg === '<p>') replacement = wrapTag('<p>', '</p>');
          break;
        case 'insertParagraph':
          replacement = selectedText ? `${selectedText}<br />` : '<br />';
          break;
        case 'removeFormat':
          replacement = selectedText ? selectedText.replace(/<[^>]*>/g, '') : currentVal.replace(/<[^>]*>/g, '');
          if (!selectedText) {
            setNativeInputValue(target, replacement);
            return;
          }
          break;
        default:
          break;
      }

      const newVal = currentVal.substring(0, start) + replacement + currentVal.substring(end);
      setNativeInputValue(target, newVal);

      try {
        target.setSelectionRange(start, start + replacement.length);
      } catch (e) {
        // Selection range not supported on some input types
      }
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
        onMouseDown={(e) => { e.preventDefault(); handleExecute('insertParagraph'); }}
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

  // Keep editor content in sync with external value if needed
  useEffect(() => {
    if (editorRef.current && !isCodeView) {
      if (editorRef.current.innerHTML !== value) {
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
          placeholder={placeholder}
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
