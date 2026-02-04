import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { videoLinks } from "@/lib/config";
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function WelcomeVideo() {
  return (
    <>
        <Dialog>
            <DialogTrigger>Open</DialogTrigger>
            <DialogContent className={'h-svh py-5 px-0 bg-transparent rounded-0 border-0 [&>button]:opacity-100 [&>button]:-right-3 [&>button]:top-2 [&>button]:bg-[#4CB7BB] [&>button]:rounded-full [&>button]:rounded-bl-none [&>button]:text-white [&>button]:size-6 [&>button]:flex [&>button]:justify-center [&>button]:items-center'}>
                <DialogHeader className={"bg-zinc-700 py-10 gap-0 justify-center"}>
                    <div className='bg-gradient-to-l from-[#49b8c1] to-[#fb8b65] pb-6 pt-9 p-4 text-center'>
                        <img src="/images/fullhand.png" className="w-16 mx-auto mb-3.5" />
                        <DialogTitle className="text-zinc-50 mb-3 text-xl">Welcome to Colabi!</DialogTitle>
                        <p className="text-zinc-50 text-xs font-normal">I'm Colabi-roo, your AI guide. Watch this short video to understand the big idea behind Colabi.</p>
                    </div>
                    <DialogDescription className={'bg-white p-4 py-9 flex flex-col gap-6'}>
                        <iframe title="vimeo-player" src={videoLinks.intro_video} width="100%" height="180" frameborder="0" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" allowFullScreen></iframe>
                        <Button className={"w-full bg-[#fb8b65] text-white"}>
                            <ArrowRight />
                        </Button>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    </>
  )
}
