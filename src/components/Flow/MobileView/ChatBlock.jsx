import React from 'react'
import WelcomeVideo from './WelcomeVideo'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Progress } from '@/components/ui/progress'

export default function ChatBlock() {
  return (
    <>
        <div className='bg-white fixed bottom-0 left-0 w-full h-[calc(100vh_-_50px)] z-20 p-4 flex flex-col gap-4'>
            <h2 className='text-[#F08965] text-center'>Step 1: Business Setup</h2>
            <div className='h-10 grow w-full'>
                <ul className='flex flex-col gap-2.5'>
                    <li className='flex items-start gap-2'>
                        <img src="/images/defaultroo.webp" className='size-7 rounded-full object-cover' alt="ai profile" />
                        <div className='bg-linear-to-r from-[#62AAB4] to-[#A1D6D8] p-2 rounded-lg rounded-tl-xs w-fit max-w-4/5 text-[#E5E7EB] font-normal text-xs leading-normal'>Goodmorning, Amelia! Your team has completed 12 tasks and 3 workflows are currently active. Wouldyou like a summary of today's priorities?</div>
                    </li>
                    <li className='flex flex-row-reverse items-end gap-2'>
                        <img src="/images/user-profile.png" className='size-7 rounded-full object-cover' alt="ai profile" />
                        <div className='bg-[#FFC6B2] p-2 rounded-lg rounded-br-xs w-fit max-w-4/5 text-white font-normal text-xs leading-normal'>Goodmorning, Amelia! Your team has summary of today's priorities?</div>
                    </li>
                </ul>
            </div>
            <div className='h-auto w-full border border-solid border-[#9CA3AF] rounded-md p-2'>
                <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                        <AccordionTrigger className={'p-0 text-sm hover:no-underline font-normal text-[#4A4E52]'}>
                            <div className='flex flex-col gap-1 w-2/4 grow'>
                                <p>Brain Training: <span>0%</span> Completed</p>
                                <Progress className={'bg-[#FDDBD3] [&>div]:bg-[#F88B62]'} value={2} />
                            </div>
                         </AccordionTrigger>
                        <AccordionContent>
                            <p className='text-[#94969C] text-xs leading-normal my-2.5'>The more you add, the smarter your AI Brain gets start now or return anytime.</p>
                            <ul className='bg-[#F7FAFF] rounded-xl p-2'>
                                <li className='flex flex-row gap-1.5'>
                                    <img src="" className='size-7 object-cover' alt="Add Your Internal Team" />
                                    <h4 className='font-bold text-zinc-800 text-xs leading-none pt-2.5'>Add Your Internal Team</h4>
                                    <div className="flex items-center gap-1 w-fit ml-auto">
                                        <Checkbox id="terms" className={'data-[state=checked]:'} />
                                        <Label htmlFor="terms" className={'text-[9px] text-[#AFAFB1]'}>Completed</Label>
                                    </div>
                                </li>
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
            <WelcomeVideo />
        </div>
    </>
  )
}
