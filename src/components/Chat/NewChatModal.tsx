import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import socketService from "@/services/socket";

interface NewChatModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewChatModal: React.FC<NewChatModalProps> = ({ isOpen, onOpenChange }) => {
  const [recipient, setRecipient] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim()) {
      toast.error("Please enter a valid name or email");
      return;
    }

    setIsSubmitting(true);
    try {
      // Call socket service to join a new chat with the recipient
      socketService.joinChat(user._id, recipient);
      
      // Show success message
      toast.success(`Starting a new conversation with ${recipient}`);
      
      // Close the modal after a short delay
      setTimeout(() => {
        onOpenChange(false);
        setRecipient(""); // Reset the input field
      }, 1500);
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Failed to create new chat");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Start New Conversation</DialogTitle>
          <DialogDescription>
            Enter the name or email of the person you want to chat with
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="recipient" className="text-sm font-medium">
                Name or Email
              </label>
              <Input
                id="recipient"
                placeholder="Enter name or email"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button 
             className="bg-purple-600 hover:bg-purple-600/90"
             type="submit"
             disabled={isSubmitting}
             >
              {isSubmitting ? "Creating..." : "Start Chat"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewChatModal;