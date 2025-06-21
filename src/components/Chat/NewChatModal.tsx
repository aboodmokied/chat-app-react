import React, { useEffect, useState } from "react";
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
import { useSocket } from "@/context/SocketContext";
import axios from "axios";

interface NewChatModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
}
const apiUrl=import.meta.env.VITE_API_URL || "https://chat-api-nestjs.onrender.com";

const NewChatModal: React.FC<NewChatModalProps> = ({ isOpen, onOpenChange }) => {
  const [recipient, setRecipient] = useState("");
  const [foundUser, setFoundUser] = useState<UserData | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { user } = useAuth();
  const { socketValidationError } = useSocket();

  useEffect(() => {
    if (socketValidationError && socketValidationError.event === "joinChat") {
      const messages = Array.isArray(socketValidationError.message)
        ? socketValidationError.message
        : [socketValidationError.message];
      setValidationErrors(messages);
    }
  }, [socketValidationError]);

  const handleSearchUser = async () => {
    setFoundUser(null);
    setValidationErrors([]);
    if (!recipient.trim()) return;

    setIsSearching(true);
    try {
      const res = await axios.post(`${apiUrl}/user/by-email`, {
         email: recipient.trim()
      });
      if (res.status === 200 && res.data) {
        if(res.data._id==user._id){
          setValidationErrors(["You can't start a chat with yourself"])
        }else{
          setFoundUser(res.data);
        }
      } else {
        setValidationErrors(["Unexpected response from server."]);
      }
    } catch (err: any) {
      if (err.response) {
        const status = err.response.status;

        if (status === 404) {
          setValidationErrors(["No user found with this email."]);
        } else if (status === 400) {
          const msg = err.response.data?.message || "Invalid request.";
          setValidationErrors(Array.isArray(msg) ? msg : [msg]);
        } else {
          setValidationErrors(["Server error. Please try again later."]);
        }
      } else {
        setValidationErrors(["Network error. Check your connection."]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundUser) {
      toast.error("Please search and select a valid user first.");
      return;
    }

    setIsSubmitting(true);
    try {
      socketService.joinChat(user._id, foundUser.email);
      toast.success(`Starting a new conversation with ${foundUser.name}`);
      setRecipient("");
      setFoundUser(null);
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Failed to create new chat");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipient(e.target.value);
    setValidationErrors([]);
    setFoundUser(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Start New Conversation</DialogTitle>
          <DialogDescription>
            Enter the email of the person you want to chat with, then search.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="recipient" className="text-sm font-medium">
                Email
              </label>
              <div className="flex gap-2">
                <Input
                  id="recipient"
                  placeholder="Enter email"
                  value={recipient}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  onClick={handleSearchUser}
                  disabled={isSearching || !recipient.trim()}
                  className="bg-gray-200 text-black hover:bg-purple-600/90 hover:text-white"
                >
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </div>

              {validationErrors.length > 0 && (
                <ul className="text-sm text-red-500 mt-1 space-y-1">
                  {validationErrors.map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
              )}

              {foundUser && (
                <div className="mt-2 p-3 bg-gray-100 rounded-md border text-sm">
                  <div><strong>Name:</strong> {foundUser.name}</div>
                  <div><strong>Email:</strong> {foundUser.email}</div>
                </div>
              )}
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
              disabled={isSubmitting || !foundUser}
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
