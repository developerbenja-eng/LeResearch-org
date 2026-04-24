'use client';

import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import SendToKindleDialog from './SendToKindleDialog';

interface SendToKindleButtonProps {
  paperId: string;
  paperTitle: string;
}

export default function SendToKindleButton({ paperId, paperTitle }: SendToKindleButtonProps) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className="w-full flex items-center gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/10 hover:border-orange-300 dark:hover:border-orange-800 transition-all group"
      >
        <div className="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors">
          <BookOpen size={18} className="text-orange-600 dark:text-orange-400" />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Send to Kindle</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Read on your device</p>
        </div>
      </button>

      <SendToKindleDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        paperId={paperId}
        paperTitle={paperTitle}
      />
    </>
  );
}
