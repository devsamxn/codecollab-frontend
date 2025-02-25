import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { CircularProgress } from "@heroui/react";

export default function CabinDropdown({ setRoomId, roomId }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState("false");

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/rooms/list`)
      .then((res) => {
        setRooms(res.data);
        console.log(res.data);
      })
      .catch((err) => console.error("Error fetching rooms:", err));
    setLoading(false);
  }, []);
  return loading ? (
    <CircularProgress aria-label="Loading..." />
  ) : rooms.length == 0 ? (
    <p className="text-xl p-3 text-gray-400 text-center">
      No rooms created in the last 24 hours.
    </p>
  ) : (
    <Dropdown className="text-white text-center">
      <DropdownTrigger>
        <Button
          variant="bordered"
          className="cursor-pointer border-white border-1 rounded-2xl hover:bg-black font-semibold text-2xl"
        >
          {roomId || "Select Room"}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Static Actions"
        onAction={(id) => setRoomId(id)}
        className="rounded-2xl"
      >
        {rooms.map((room) => (
          <DropdownItem
            className="rounded-2xl bg-gray-800 hover:bg-gray-200 hover:text-black hover:border-black hover:border-2 text-xl"
            key={room}
          >
            Room ID: {room}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
