"use client";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUp, Loader2, AlertCircle, CheckCircle2, Copy, Check } from "lucide-react";
import { useState } from "react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { Card, CardTitle, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface crawledData {
  url: string
  markdownData: string
  title: string | ''
}

interface OutputData {
  markdown: string,
  title: string | '',
  imageUrls: string[]
}

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [output, setOutput] = useState<OutputData | crawledData[] | string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'scrape' | 'crawl' | null>(null);
  const [error, setError] = useState<string>('');
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' });
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Toast utility function
  const showToast = (message: string, type: ToastState['type']) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'info' });
    }, 4000);
  };

  // Input validation
  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  async function handleScrape() {
    // Validation
    if (!url.trim()) {
      setError("Please enter a URL");
      showToast("Please enter a URL", 'error');
      return;
    }

    if (!isValidUrl(url)) {
      setError("Please enter a valid URL (include http:// or https://)");
      showToast("Please enter a valid URL", 'error');
      return;
    }

    setIsLoading(true);
    setLoadingType('scrape');
    setError('');
    setOutput('');

    try {
      const response = await axios.post("https://web2md.shortsy.xyz/scrape", {
        url,
      }, {
        timeout: 120000,
        validateStatus: (status) => status < 500 // Accept 4xx errors to handle them gracefully
      });

      if (response.status >= 400) {
        throw new Error(`Server returned ${response.status}: ${response.data?.message || 'Unknown error'}`);
      }

      if (!response.data?.result) {
        throw new Error("No data received from server");
      }

      setOutput(response.data.result);
      setUrl(response.data.url || url);
      showToast("Page scraped successfully!", 'success');

    } catch (error) {
      console.error("Error scraping:", error);

      let errorMessage = "Failed to scrape the page. ";

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          errorMessage += "Request timed out. The page might be too large or slow to load.";
        } else if (error.response?.status === 404) {
          errorMessage += "Page not found. Please check the URL.";
        } else if (error.response?.status === 403) {
          errorMessage += "Access denied. The website might be blocking automated requests.";
        } else if (error.response?.status! >= 500) {
          errorMessage += "Server error. Please try again later.";
        } else if (error.message.includes('Network Error')) {
          errorMessage += "Network error. Please check your connection.";
        } else {
          errorMessage += error.response?.data?.message || error.message || "Unknown error occurred.";
        }
      } else {
        errorMessage += (error as Error).message || "Unknown error occurred.";
      }

      setError(errorMessage);
      showToast(errorMessage, 'error');
      setOutput('');
    } finally {
      setIsLoading(false);
      setLoadingType(null);
    }
  }

  async function handleCrawl() {
    // Validation
    if (!url.trim()) {
      setError("Please enter a URL");
      showToast("Please enter a URL", 'error');
      return;
    }

    if (!isValidUrl(url)) {
      setError("Please enter a valid URL (include http:// or https://)");
      showToast("Please enter a valid URL", 'error');
      return;
    }

    setIsLoading(true);
    setLoadingType('crawl');
    setError('');
    setOutput('');

    try {
      const response = await axios.post("https://web2md.shortsy.xyz/crawl", {
        url,
      }, {
        timeout: 120000,
        validateStatus: (status) => status < 500
      });

      if (response.status >= 400) {
        throw new Error(`Server returned ${response.status}: ${response.data?.message || 'Unknown error'}`);
      }

      if (!response.data?.result) {
        throw new Error("No data received from server");
      }

      console.log(response.data);
      setOutput(response.data.result);
      showToast(`Successfully crawled ${Array.isArray(response.data.result) ? response.data.result.length : 1} page(s)!`, 'success');

    } catch (error) {
      console.error("Error crawling:", error);

      let errorMessage = "Failed to crawl the website. ";

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          errorMessage += "Request timed out. The website might have too many pages or be slow to respond.";
        } else if (error.response?.status === 404) {
          errorMessage += "Website not found. Please check the URL.";
        } else if (error.response?.status === 403) {
          errorMessage += "Access denied. The website might be blocking automated crawling.";
        } else if (error.response?.status! >= 500) {
          errorMessage += "Server error. Please try again later.";
        } else if (error.message.includes('Network Error')) {
          errorMessage += "Network error. Please check your connection.";
        } else {
          errorMessage += error.response?.data?.message || error.message || "Unknown error occurred.";
        }
      } else {
        errorMessage += (error as Error).message || "Unknown error occurred.";
      }

      setError(errorMessage);
      showToast(errorMessage, 'error');
      setOutput('');
    } finally {
      setIsLoading(false);
      setLoadingType(null);
    }
  }

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent, action: 'scrape' | 'crawl') => {
    if (e.key === 'Enter' && !isLoading) {
      if (action === 'scrape') {
        handleScrape();
      } else {
        handleCrawl();
      }
    }
  };

  // Copy functionality
  const handleCopy = async (text: string, index?: number) => {
    try {
      await navigator.clipboard.writeText(text);
      if (typeof index === 'number') {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      }
      showToast("Copied to clipboard!", 'success');
    } catch (err) {
      showToast("Failed to copy to clipboard", 'error');
    }
  };

  return (
    <div className="flex min-h-screen flex-col mx-auto w-full">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <Alert className={`w-80 ${
            toast.type === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-950' :
            toast.type === 'error' ? 'border-red-500 bg-red-50 dark:bg-red-950' :
            'border-blue-500 bg-blue-50 dark:bg-blue-950'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            )}
            <AlertDescription className={
              toast.type === 'success' ? 'text-green-800 dark:text-green-200' :
              toast.type === 'error' ? 'text-red-800 dark:text-red-200' :
              'text-blue-800 dark:text-blue-200'
            }>
              {toast.message}
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className=" border-b border-zinc-700/20 dark:border-zinc-200/10">
        <header className="max-w-7xl mx-auto flex flex-row justify-between w-full">
          <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
            <h1 className="text-lg font-semibold">Web2MD</h1>
          </div>
          <div className="flex items-center justify-center gap-3">
            <ThemeToggle />
            <a href="https://github.com/faizanr27/Web2Md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className="text-black dark:text-gray-500"
              >
                <path
                  fill="currentColor"
                  d="M12 .297c-6.63 0-12 5.373-12 12c0 5.303 3.438 9.8 8.205 11.385c.6.113.82-.258.82-.577c0-.285-.01-1.04-.015-2.04c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729c1.205.084 1.838 1.236 1.838 1.236c1.07 1.835 2.809 1.305 3.495.998c.108-.776.417-1.305.76-1.605c-2.665-.3-5.466-1.332-5.466-5.93c0-1.31.465-2.38 1.235-3.22c-.135-.303-.54-1.523.105-3.176c0 0 1.005-.322 3.3 1.23c.96-.267 1.98-.399 3-.405c1.02.006 2.04.138 3 .405c2.28-1.552 3.285-1.23 3.285-1.23c.645 1.653.24 2.873.12 3.176c.765.84 1.23 1.91 1.23 3.22c0 4.61-2.805 5.625-5.475 5.92c.42.36.81 1.096.81 2.22c0 1.606-.015 2.896-.015 3.286c0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                />
              </svg>
            </a>
          </div>
        </header>
      </div>

      <main className="flex-1 max-w-7xl mx-auto">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Turn any site into LLM ready markdown Data
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Extract structured content from websites for your AI models
                  and applications.
                </p>
              </div>
              <div className="w-full max-w-md space-y-8">
                <Tabs defaultValue="scrape" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 dark:bg-zinc-400/20 bg-slate-200/40">
                    <TabsTrigger value="scrape" disabled={isLoading}>
                      Scrape
                    </TabsTrigger>
                    <TabsTrigger value="crawl" disabled={isLoading}>
                      Crawl
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="scrape" className="mt-6 space-y-4">
                    <div className="flex w-full items-center space-x-2 px-2 py-2 shadow-md shadow-purple-600 border border-zinc-200/30 rounded-xl">
                      <Input
                        placeholder="Enter URL to scrape single page (e.g., https://example.com)"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, 'scrape')}
                        className="outline-none border-0 rounded-4xl"
                        disabled={isLoading}
                      />

                      <Button
                        type="submit"
                        onClick={handleScrape}
                        disabled={isLoading || !url.trim()}
                        className="min-w-10"
                      >
                        {isLoading && loadingType === 'scrape' ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowUp className="h-4 w-4 border border-zinc-600/80 dark:border-zinc-200/30 rounded" />
                        )}
                      </Button>
                    </div>
                    {isLoading && loadingType === 'scrape' && (
                      <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Scraping page... This may take up to 2 minutes
                      </p>
                    )}
                  </TabsContent>
                  <TabsContent value="crawl" className="mt-6 space-y-4">
                    <div className="flex w-full items-center space-x-2 px-2 py-2 shadow-md shadow-purple-600 border border-zinc-200/30 rounded-xl">
                      <Input
                        placeholder="Enter URL to crawl subpages (e.g., https://example.com)"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, 'crawl')}
                        className="outline-none border-0 rounded-4xl"
                        disabled={isLoading}
                      />
                      <Button
                        type="submit"
                        onClick={handleCrawl}
                        disabled={isLoading || !url.trim()}
                        className="min-w-10"
                      >
                        {isLoading && loadingType === 'crawl' ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowUp className="h-4 w-4 border border-zinc-600/80 dark:border-zinc-200/30 rounded" />
                        )}
                      </Button>
                    </div>
                    {isLoading && loadingType === 'crawl' && (
                      <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Crawling website... This may take up to 2 minutes
                      </p>
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              {/* Error Display */}
              {error && (
                <div className="w-full max-w-2xl">
                  <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <AlertDescription className="text-red-800 dark:text-red-200">
                      {error}
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              <h3 className="mb-2 font-medium">Output Preview</h3>

              {!Array.isArray(output) && typeof output === 'object' && 'markdown' in output ?
               (<div className="w-container">
                <div className=" rounded-md bg-muted p-2 ">
                  <Card className="w-full max-w-md max-h-[500px] flex flex-col border border-zinc-600/30 dark:border-zinc-200/10">
                    <CardHeader className="flex-shrink-0 border-b border-zinc-600/30 w-full text-left dark:bg-zinc-400/20 bg-slate-200/40">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-md">{output?.title || "Untitled"}</CardTitle>
                          <CardTitle className="text-sm font-extralight">{url || "URL not available"}</CardTitle>
                        </div>
                        <Button
                          onClick={() => handleCopy(output?.markdown || '')}
                          variant="ghost"
                          size="sm"
                          className="ml-2 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-grow overflow-y-scroll p-4 scrollbar-thin scrollbar-thumb-zinc-500 scrollbar-track-transparent">
                      <div className="rounded-md bg-muted text-left">
                        <pre className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
                          {output?.markdown || "Markdown output will appear here..."}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              )
            : Array.isArray(output) ? ( <div className="w-container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {output.map((item, index) => (
                <Card key={index} className="w-full max-w-md h-[500px] flex flex-col border border-zinc-600/30 dark:border-zinc-200/10">
                  <CardHeader className="flex-shrink-0 border-b border-zinc-600/30 w-full text-left dark:bg-zinc-400/20 bg-slate-200/40">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-md">{item?.title}...</CardTitle>
                        <CardTitle className="text-sm font-extralight">{item?.url}</CardTitle>
                      </div>
                      <Button
                        onClick={() => handleCopy(item?.markdownData || '', index)}
                        variant="ghost"
                        size="sm"
                        className="ml-2 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      >
                        {copiedIndex === index ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-grow overflow-y-auto p-4 scrollbar-thin">
                    <div className="rounded-md bg-muted text-left">
                      <pre className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
                        {item?.markdownData}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          ) : output && typeof output === 'string' ? (
            <div className="w-full max-w-2xl">
              <div className="relative rounded-md bg-muted p-4 text-left">
                <Button
                  onClick={() => handleCopy(output)}
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <pre className="whitespace-pre-wrap break-words text-sm text-muted-foreground pr-12">
                  {output}
                </pre>
              </div>
            </div>
          ) : !isLoading ? (
            // Fallback Case - only show when not loading
            <div className="text-center text-sm text-muted-foreground">
              Enter a URL above to get started
            </div>
          ) : null}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-300 dark:border-zinc-200/10 py-6 ">
        <div className="container max-w-7xl mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Web2MD. All rights reserved.
          </p>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            This tool is for educational purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
}