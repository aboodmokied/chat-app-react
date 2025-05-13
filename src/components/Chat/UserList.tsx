
import { User } from "@/services/socket";
import React from "react";
// import { User } from "../../services/socket";

interface UserListProps {
  users: User[];
}

const UserList: React.FC<UserListProps> = ({ users }) => {
  return (
    <div className="py-2">
      <p className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
        Chat Users — {users.length}
      </p>
      <div className="space-y-1">
        {users.map((user:User) => (
          <div
            key={user._id}
            className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <div className="relative flex-shrink-0">
              <img
                src={/*user.avatar ||*/`https://ui-avatars.com/api/?name=${user.name}`}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
              {/* <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span> */}
            </div>
            <span className="ml-2 font-medium truncate">{user.name}</span>
          </div>
        ))}
      </div>

      
    </div>
  );
};

export default React.memo(UserList);
