import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Phone, Mail, Linkedin, ShieldAlert } from 'lucide-react';

const boardMembers = [
  { name: 'Alice Johnson', role: 'President', image: 'https://picsum.photos/100/100?random=9', hint: 'woman portrait' },
  { name: 'Bob Williams', role: 'Vice President', image: 'https://picsum.photos/100/100?random=10', hint: 'man portrait' },
  { name: 'Charlie Brown', role: 'Treasurer', image: 'https://picsum.photos/100/100?random=11', hint: 'person portrait' },
];

const MemberCard = ({ member }: { member: typeof boardMembers[0] }) => {
  return (
    <div className="group w-full [perspective:1000px]">
      <div className="relative h-24 w-full rounded-lg transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        {/* Front */}
        <div className="absolute inset-0 [backface-visibility:hidden]">
          <div className="h-full w-full rounded-lg bg-secondary flex items-center p-4">
            <Avatar className="h-16 w-16 border-4 border-background shadow-md">
              <AvatarImage src={member.image} alt={member.name} data-ai-hint={member.hint} />
              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="ml-4">
              <h4 className="font-semibold">{member.name}</h4>
              <p className="text-sm text-muted-foreground">{member.role}</p>
            </div>
          </div>
        </div>
        {/* Back */}
        <div className="absolute inset-0 rounded-lg bg-primary [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <div className="flex h-full w-full items-center justify-evenly text-primary-foreground">
             <Button variant="ghost" size="icon" className="hover:bg-white/20">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-white/20">
              <Mail className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-white/20">
              <Linkedin className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export function BoardAndSos() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Board Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {boardMembers.map((member) => (
            <MemberCard key={member.name} member={member} />
          ))}
        </CardContent>
      </Card>
      <Card className="bg-accent/20 border-accent">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Quick Help</CardTitle>
        </CardHeader>
        <CardContent>
           <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="default" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
                    <ShieldAlert className="mr-2 h-5 w-5" /> Emergency SOS
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="font-headline text-2xl">Emergency SOS</AlertDialogTitle>
                <AlertDialogDescription>
                  If this is a life-threatening emergency, please call your local emergency number immediately.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-4">
                 <a href="tel:911" className="w-full">
                  <Button variant="destructive" className="w-full">
                    <Phone className="mr-2 h-4 w-4" /> Call Emergency Services
                  </Button>
                </a>
                <a href="tel:123-456-7890" className="w-full">
                   <Button variant="secondary" className="w-full">
                    <Phone className="mr-2 h-4 w-4" /> Call Campus Security
                  </Button>
                </a>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Close</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </>
  );
}
