import React, { useState } from 'react';
import Button from './Button.jsx';
import { useToast } from './Toast.jsx';

export default function WadnDisplay({ wadn, className = '', ...props }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!wadn) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(wadn);
      } else {
        const ta = document.createElement('textarea');
        ta.value = wadn;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      toast.success('Copied WADN to clipboard');
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      toast.error('Could not copy to clipboard');
    }
  };

  return (
    <div className={`ui-wadn ${className}`.trim()} {...props}>
      <span className="ui-wadn-code">{wadn || 'WADN-IND-2026-XXXXXXXX'}</span>
      <Button
        variant="secondary"
        size="sm"
        className="ui-wadn-copy"
        onClick={handleCopy}
        disabled={!wadn}
      >
        {copied ? 'Copied' : 'Copy'}
      </Button>
    </div>
  );
}

/*
Example usage:
  <WadnDisplay wadn="WADN-IND-2026-AB12CD34EF" />
*/
