"use client";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Github } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [output, setOutput] = useState("");

  async function handleScrape() {
    try {
      const response = await axios.post("http://localhost:5000/process-url", {
        url,
      });
      setOutput(response.data.result.markdown || "No data found.");
    } catch (error) {
      console.error("Error scraping:", error);
      setOutput("Failed to fetch data. Please try again.");
    }
  }

  async function handleCrawl() {
    try {
      const response = await axios.post("https://localhost:5000/crawl", {
        url,
      });
      setOutput(response.data.markdown || "No data found.");
    } catch (error) {
      console.error("Error crawling:", error);
      setOutput("Failed to fetch data. Please try again.");
    }
  }

  return (
    <div className="flex min-h-screen flex-col mx-auto w-full">
      <div className=" border-b">
        <header className="max-w-7xl mx-auto flex flex-row justify-between w-full">
          <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
            <h1 className="text-lg font-semibold">Web2MD</h1>
          </div>
          <div className="flex items-center justify-center">
            <a href="https://github.com/faizanr27/Web2Md">
              <Github />
            </a>
          </div>
        </header>
      </div>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Turn any site into LLM ready markdown Data
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Extract structured content from medical websites for your AI
                  models and applications.
                </p>
              </div>
              <div className="w-full max-w-md space-y-8">
                <Tabs defaultValue="scrape" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="scrape">Scrape</TabsTrigger>
                    <TabsTrigger value="crawl">Crawl</TabsTrigger>
                  </TabsList>
                  <TabsContent value="scrape" className="mt-6 space-y-4">
                    <div className="flex w-full items-center space-x-2">
                      <Input
                        placeholder="Scrape single page site"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                      />
                      <Button type="submit" onClick={handleScrape}>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Extract content from a specific medical page and convert
                      it to markdown format.
                    </p>
                  </TabsContent>
                  <TabsContent value="crawl" className="mt-6 space-y-4">
                    <div className="flex w-full items-center space-x-2">
                      <Input
                        placeholder="Crawl subpages"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                      />
                      <Button
                        type="submit"
                        onClick={handleCrawl}
                        className="border border-amber-300"
                      >
                        <ArrowRight className="h-4 w-4 stroke-zinc-950 stroke-[2]" />
                      </Button>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Automatically discover and extract content from multiple
                      related pages.
                    </p>
                  </TabsContent>
                </Tabs>

                <h3 className="mb-2 font-medium">Output Preview</h3>
                <div className="rounded-lg border bg-card p-4">
                  <div className="h-56 rounded-md bg-muted p-2 overflow-y-auto">
                    <pre className="text-sm text-left text-muted-foreground whitespace-pre-wrap">
                      {output || "Markdown output will appear here..."}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} WebMD Scraper. All rights
            reserved.
          </p>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            This tool is for educational purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
}
