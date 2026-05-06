import { useNavigate, useParams } from "react-router-dom";
import Room from "../components/Room";

export default function RoomPage() {
  const { sessionId: code } = useParams();
  const navigate = useNavigate();

  const isPO = localStorage.getItem(`poker_room_${code}_role`) === "po";
  const name = localStorage.getItem(`poker_room_${code}_name`);

  if (!isPO && !name) {
    navigate("/");
    return null;
  }

  return <Room code={code} isPO={isPO} name={isPO ? "Rodolphe" : name} />;
}
