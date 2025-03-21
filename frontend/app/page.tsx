"use client";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUp, Github, GithubIcon, LucideGithub } from "lucide-react";
import { useState } from "react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { Card, CardTitle, CardContent, CardHeader } from "@/components/ui/card";


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

export default function Home() {
  const [url, setUrl] = useState("");
  const [output, setOutput] = useState<OutputData | crawledData[]| string>('');


  async function handleScrape() {
    try {
      const response = await axios.post("http://localhost:5000/scrape", {
        url,
      }, { timeout: 60000 } );
      setOutput(response.data.result || "No data found.");
      setUrl(response.data.url)
    } catch (error) {
      console.error("Error scraping:", error);
      setOutput("Failed to fetch data. Please try again.");
    }
  }

  async function handleCrawl() {
    try {
      const response = await axios.post("http://localhost:5000/crawl", {
        url,
      });
      console.log(response.data)
      setOutput(response.data.result || "No data found.");
    } catch (error) {
      console.error("Error crawling:", error);
      setOutput("Failed to fetch data. Please try again.");
    }
  }

  return (
    <div className="flex min-h-screen flex-col mx-auto w-full">
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
                    <TabsTrigger value="scrape">Scrape</TabsTrigger>
                    <TabsTrigger value="crawl">Crawl</TabsTrigger>
                  </TabsList>
                  <TabsContent value="scrape" className="mt-6 space-y-4">
                    <div className="flex w-full items-center space-x-2 px-2 py-2 shadow-md shadow-purple-600 border border-zinc-200/30 rounded-xl">
                      <Input
                        placeholder="Scrape single page site"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="outline-none border-0 rounded-4xl"
                      />

                      <Button type="submit" onClick={handleScrape}>
                        <ArrowUp className="h-4 w-4 border border-zinc-600/80 dark:border-zinc-200/30 rounded" />
                      </Button>
                    </div>
                    {/* <p className="text-sm text-muted-foreground">
                      Scrape single page
                    </p> */}
                  </TabsContent>
                  <TabsContent value="crawl" className="mt-6 space-y-4">
                    <div className="flex w-full items-center space-x-2 px-2 py-2 shadow-md shadow-purple-600 border border-zinc-200/30 rounded-xl">
                      <Input
                        placeholder="Crawl subpages"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="outline-none border-0 rounded-4xl"
                      />
                      <Button type="submit" onClick={handleCrawl}>
                        <ArrowUp className="h-4 w-4 border border-zinc-600/80 dark:border-zinc-200/30 rounded" />
                      </Button>
                    </div>

                    {/* <p className="text-sm text-muted-foreground">
                      Crawl subpages and extract content
                    </p> */}
                  </TabsContent>
                </Tabs>
                </div>

                <h3 className="mb-2 font-medium">Output Preview</h3>

                {!Array.isArray(output) && typeof output === 'object' && 'markdown' in output ?
                 (<div className="w-container">
                  <div className=" rounded-md bg-muted p-2 ">
                    <Card className="w-full max-w-md max-h-[500px] flex flex-col border border-zinc-600/30 dark:border-zinc-200/10">
                      <CardHeader className="flex-shrink-0 border-b border-zinc-600/30 w-full text-left dark:bg-zinc-400/20 bg-slate-200/40">
                        <CardTitle className="text-md">{output?.title || "Untitled"}</CardTitle>
                        <CardTitle className="text-sm font-extralight">{url || "URL not available"}</CardTitle>
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
                    <CardTitle className="text-md">{item?.title}...</CardTitle>
                      <CardTitle className="text-sm font-extralight">{item?.url}</CardTitle>
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
            ) : (
              // Fallback Case
              <div className="text-center text-sm text-muted-foreground">
                No data available
              </div>

               ) }
              </div>
          </div>
        </section>
{/*
        {typeof output === "string"
                      ? output || "Markdown output will appear here..."
                      : output.map((item: crawlData, index) => <div key={index}>
                        <h2 className="dark:bg-zinc-400/20 bg-slate-200/40">{item?.url}</h2>
                        {item?.body}
                        {item?.aTag}
                        </div>)} */}


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
