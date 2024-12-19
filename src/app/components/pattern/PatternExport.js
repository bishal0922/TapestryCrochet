// src/components/pattern/PatternExport.jsx
import React from 'react';
import { usePattern } from '@/contexts/PatternContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Download,
  FileText,
  FileJson,
  FileCode,
  Share2
} from 'lucide-react';
import { exportPattern, downloadFile } from '@/lib/patternExporter';

const PatternExport = () => {
  const { state } = usePattern();
  const { pattern, colorPalette } = state;

  const handleExport = (format) => {
    if (!pattern) return;

    const timestamp = new Date().toISOString().split('T')[0];
    let content, filename;

    try {
      content = exportPattern(pattern, colorPalette, format);
      
      switch (format) {
        case 'text':
          filename = `pattern_${timestamp}.txt`;
          break;
        case 'html':
          filename = `pattern_${timestamp}.html`;
          break;
        case 'json':
          filename = `pattern_${timestamp}.json`;
          break;
      }

      downloadFile(
        content, 
        filename, 
        format === 'html' ? 'text/html' : 'text/plain'
      );
    } catch (error) {
      console.error('Export failed:', error);
      // Here you could add a toast notification for error handling
    }
  };

  const handleShare = async () => {
    try {
      const shareData = {
        title: 'Tapestry Crochet Pattern',
        text: 'Check out this tapestry crochet pattern!',
        files: [
          new File(
            [exportPattern(pattern, colorPalette, 'html')],
            'pattern.html',
            { type: 'text/html' }
          )
        ]
      };

      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback to clipboard copy
        await navigator.clipboard.writeText(
          exportPattern(pattern, colorPalette, 'text')
        );
        // Here you could add a toast notification for successful copy
      }
    } catch (error) {
      console.error('Share failed:', error);
      // Here you could add a toast notification for error handling
    }
  };

  if (!pattern) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Pattern</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={() => handleExport('text')}
            className="w-full"
          >
            <FileText className="mr-2 h-4 w-4" />
            Text Format
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleExport('html')}
            className="w-full"
          >
            <FileCode className="mr-2 h-4 w-4" />
            HTML Preview
          </Button>

          <Button
            variant="outline"
            onClick={() => handleExport('json')}
            className="w-full"
          >
            <FileJson className="mr-2 h-4 w-4" />
            JSON Data
          </Button>

          <Button
            variant="outline"
            onClick={handleShare}
            className="w-full"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share Pattern
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Export formats:</p>
          <ul className="list-disc pl-4 space-y-1 mt-2">
            <li>Text: Simple text format for easy reading and printing</li>
            <li>HTML: Interactive web preview with color visualization</li>
            <li>JSON: Raw data format for programmatic use</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatternExport;