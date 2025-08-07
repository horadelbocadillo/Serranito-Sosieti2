import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bold, Italic, Underline } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor = ({ value, onChange, placeholder, className }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState('16');

useEffect(() => {
  if (editorRef.current && value !== undefined) {
    const currentHtml = editorRef.current.innerHTML;
    const cleanValue = value || '';
    if (cleanValue !== currentHtml) {
      editorRef.current.innerHTML = cleanValue;
    }
  }
}, [value]);

 const handleInput = () => {
  if (editorRef.current) {
    const content = editorRef.current.innerHTML;
    // Limpia contenido vacío
    const cleanContent = content === '<br>' || content === '<div><br></div>' ? '' : content;
    onChange(cleanContent);
  }
};

  const execCommand = (command: string, value?: string) => {
  document.execCommand(command, false, value);
  // actualiza manualmente el contenido
  setTimeout(() => {
    handleInput(); // Actualiza el formulario con el nuevo HTML
  }, 0);
};

  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    execCommand('fontSize', '7'); // Use fontSize 7 then override with CSS
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.style.fontSize = `${size}px`;
      try {
        range.surroundContents(span);
      } catch (e) {
        // If surroundContents fails, just apply to the whole editor
        if (editorRef.current) {
          editorRef.current.style.fontSize = `${size}px`;
        }
      }
    }
    handleInput();
  };

  return (
    <div className={`border border-input rounded-md ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b border-input bg-muted/50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('bold')}
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('italic')}
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('underline')}
          className="h-8 w-8 p-0"
        >
          <Underline className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-2" />

        <Select value={fontSize} onValueChange={handleFontSizeChange}>
          <SelectTrigger className="w-[80px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12">12px</SelectItem>
            <SelectItem value="14">14px</SelectItem>
            <SelectItem value="16">16px</SelectItem>
            <SelectItem value="18">18px</SelectItem>
            <SelectItem value="20">20px</SelectItem>
            <SelectItem value="24">24px</SelectItem>
            <SelectItem value="28">28px</SelectItem>
            <SelectItem value="32">32px</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[200px] p-3 text-sm focus:outline-none prose prose-sm max-w-none [&:empty:before]:content-[attr(data-placeholder)] [&:empty:before]:text-muted-foreground [&:empty:before]:pointer-events-none"
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: '1.5'
        }}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
      />
    </div>
  );
};

export default RichTextEditor;
