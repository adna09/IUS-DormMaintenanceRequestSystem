import { useMemo, useState } from "react";
import a100 from "../../assets/rooms/A-100.png";
import a101 from "../../assets/rooms/A-101.png";
import b200 from "../../assets/rooms/B-200.png";
import b201 from "../../assets/rooms/B-201.png";
import vip1 from "../../assets/rooms/Vip-1.png";
import vip2 from "../../assets/rooms/Vip-2.png";
import bathroomImg from "../../assets/rooms/Bathroom.png";
import libraryImg from "../../assets/rooms/Library.png";
import chillImg from "../../assets/rooms/Chill-room.png";
import ironingImg from "../../assets/rooms/Ironing-room.png";
import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Sparkles,
  Users,
} from "lucide-react";
import { createRequest } from "../../utils/requests";

export default function StudentDashboard() {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  const opinions = [
    {
      name: "Amina",
      text: "The staff response time was fast, and the request tracking made everything clear.",
    },
    {
      name: "Emir",
      text: "Rooms are organized and the common areas are great for meeting people and studying.",
    },
    {
      name: "Lina",
      text: "I like that I can submit a request in one place and see status updates anytime.",
    },
  ];

  const roomPicker = useMemo(
    () => [
      {
        id: "double",
        name: "Double room",
        images: [a100, a101, bathroomImg],
        price: { amount: 2250, deposit: 100 },
        breakfastIncluded: true,
        rooms: [
          { id: "A100", label: "A100", images: [a100, bathroomImg] },
          { id: "A101", label: "A101", images: [a101, bathroomImg] },
        ],
        beds: 2,
        bathroomIncluded: true,
      },
      {
        id: "three",
        name: "Three room",
        images: [b200, b201, bathroomImg],
        price: { amount: 2250, deposit: 100 },
        breakfastIncluded: true,
        rooms: [
          { id: "B200", label: "B200", images: [b200, bathroomImg] },
          { id: "B201", label: "B201", images: [b201, bathroomImg] },
        ],
        beds: 3,
        bathroomIncluded: true,
      },
      {
        id: "vip-double",
        name: "VIP room (double)",
        images: [vip1, vip2, bathroomImg, libraryImg, chillImg, ironingImg],
        price: { amount: 3000, deposit: 100 },
        breakfastIncluded: true,
        rooms: [{ id: "V300", label: "V300", images: [vip1, vip2, bathroomImg, chillImg, ironingImg, libraryImg] }],
        beds: 2,
        bathroomIncluded: true,
        vipExtras: true,
      },
    ],
    []
  );

  const [roomIndex, setRoomIndex] = useState(0);
  const [selectedRoomId, setSelectedRoomId] = useState(roomPicker[0]?.rooms?.[0]?.id ?? "");
  const [photoIndex, setPhotoIndex] = useState(0);

  const activeRoom = roomPicker[roomIndex];
  const activeRoomOptions = activeRoom?.rooms ?? [];
  const selectedRoom = activeRoomOptions.find((r) => r.id === selectedRoomId) ?? activeRoomOptions[0];
  const roomPhotos = selectedRoom?.images ?? activeRoom?.images ?? [];

  const submitRoomPreference = () => {
    if (!activeRoom) return;

    createRequest({
      type: "Room selection",
      title: `Room preference: ${activeRoom.name}`,
      category: "Room selection",
      location: selectedRoom?.id ? `Room: ${selectedRoom.id}` : "Room not selected",
      priority: "Low",
      description: [
        `Room type: ${activeRoom.name}`,
        `Beds: ${activeRoom.beds}`,
        `Breakfast included: ${activeRoom.breakfastIncluded ? "Yes" : "No"}`,
        `Bathroom included: ${activeRoom.bathroomIncluded ? "Yes" : "No"}`,
        `Selected room: ${selectedRoom?.id || "N/A"}`,
        `Advance payment: €${activeRoom.price.amount} + €${activeRoom.price.deposit} deposit`,
      ].join("\n"),
      meta: {
        roomType: activeRoom.id,
        selectedRoom: selectedRoom?.id ?? "",
        price: activeRoom.price,
      },
    });

    window.location.href = "/student/my-requests";
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
        <div
          className="p-6"
          style={{
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center center",
            backgroundSize: "cover",
          }}
        >
          <div className="rounded-xl bg-background/60 p-1 backdrop-blur sm:p-1">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Hi{user?.name ? `, ${user.name}` : ""}.
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Browse room types, pick a specific room, and submit your preference. For maintenance, submit a request anytime.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href="/student/submit"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90"
              >
                Submit request
              </a>
              <a
                href="/student/my-requests"
                className="inline-flex items-center justify-center rounded-md border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted"
              >
                View my requests
              </a>
            </div>
          </div>
        </div>

      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="rounded-xl border bg-muted/40 p-4 shadow-sm sm:p-5">
            <div className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Room options</h2>
                <p className="text-sm text-muted-foreground">
                  Browse types, then pick a specific room number to preview photos and submit your preference.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <div className="overflow-hidden rounded-xl border bg-muted">
                  <div className="relative">
                    <img
                      src={roomPhotos[Math.min(photoIndex, Math.max(roomPhotos.length - 1, 0))] ?? activeRoom?.images?.[0]}
                      alt={`${activeRoom?.name ?? "Room"} photo`}
                      className="h-52 w-full object-cover sm:h-64"
                    />
                    <div className="absolute inset-0 bg-gradient from-background/40 via-transparent to-transparent" />

                    {roomPhotos.length > 1 ? (
                      <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setPhotoIndex((i) => (i - 1 + roomPhotos.length) % roomPhotos.length)
                          }
                          className="inline-flex items-center gap-2 rounded-md bg-background/80 px-3 py-2 text-sm font-medium backdrop-blur hover:bg-background"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Prev
                        </button>
                        <div className="rounded-md bg-background/70 px-3 py-2 text-xs text-foreground backdrop-blur">
                          Photo {Math.min(photoIndex + 1, roomPhotos.length)} / {roomPhotos.length}
                        </div>
                        <button
                          type="button"
                          onClick={() => setPhotoIndex((i) => (i + 1) % roomPhotos.length)}
                          className="inline-flex items-center gap-2 rounded-md bg-background/80 px-3 py-2 text-sm font-medium backdrop-blur hover:bg-background"
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="absolute bottom-3 right-3 rounded-md bg-background/70 px-3 py-2 text-xs text-foreground backdrop-blur">
                        <span className="inline-flex items-center gap-2">
                          <ImageIcon className="h-3.5 w-3.5" />
                          1 photo
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-base font-semibold">{activeRoom?.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {activeRoom?.beds} beds • Bathroom included
                      {activeRoom?.vipExtras ? " • VIP amenities included" : ""}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const next = (roomIndex - 1 + roomPicker.length) % roomPicker.length;
                        setRoomIndex(next);
                        setSelectedRoomId(roomPicker[next]?.rooms?.[0]?.id ?? "");
                        setPhotoIndex(0);
                      }}
                      className="inline-flex items-center justify-center rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const next = (roomIndex + 1) % roomPicker.length;
                        setRoomIndex(next);
                        setSelectedRoomId(roomPicker[next]?.rooms?.[0]?.id ?? "");
                        setPhotoIndex(0);
                      }}
                      className="inline-flex items-center justify-center rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="rounded-xl border bg-background p-4">
                  <div className="text-sm font-semibold">Pick a room number</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Double: A100/A101 • Three: B200/B201 • VIP: V300.
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {(activeRoomOptions ?? []).map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setSelectedRoomId(r.id);
                          setPhotoIndex(0);
                        }}
                        className={[
                          "rounded-full px-3 py-1 text-xs font-medium transition",
                          selectedRoomId === r.id
                            ? "bg-primary text-primary-foreground"
                            : "border bg-background hover:bg-muted",
                        ].join(" ")}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border bg-background p-4">
                  <div className="text-sm font-semibold">Bathroom</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Bathroom is included for the room types shown here.
                  </p>
                </div>

                <div className="rounded-xl border bg-background p-4">
                  <div className="text-sm font-semibold">Price</div>
                  <div className="mt-2 rounded-lg border bg-muted p-3">
                    <div className="text-xs text-muted-foreground">Advance payment</div>
                    <div className="mt-1 text-lg font-semibold">
                      €{activeRoom?.price?.amount?.toLocaleString?.() ?? activeRoom?.price?.amount} + €
                      {activeRoom?.price?.deposit} deposit
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Deposit refunded to the student at the end of the academic year.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={submitRoomPreference}
                    className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90"
                  >
                    Submit room preference (request)
                  </button>
                </div>
              </div>
            </div>
            </div>
          </div>

        </section>

        <aside>
          <div className="rounded-xl border bg-muted/40 p-4 shadow-sm sm:p-5">
            <div className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
              <h2 className="text-lg font-semibold">Student opinions</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                What other students say about living in the dorms.
              </p>

              <div className="mt-4 space-y-3">
                {opinions.map((o) => (
                  <div key={o.name} className="rounded-lg border bg-background p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">{o.name}</p>
                      <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                        Verified
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">“{o.text}”</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}