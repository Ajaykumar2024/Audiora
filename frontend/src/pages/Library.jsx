// export default function Library() {
//   const dummyAlbums = [
//     {
//       _id: "a1",
//       title: "Midnight Vibes",
//       artistName: "DJ Shivraj",
//       coverImage: "https://images.unsplash.com/photo-1493225457124-a1a2a5956093?w=300&q=80",
//       songCount: 5
//     }
//   ];

//   return (
//     <div className="mt-6">
//       <h1 className="text-3xl font-bold mb-6 text-white">Your Library</h1>
//       <h2 className="text-xl font-semibold mb-4 text-zinc-300">Saved Albums</h2>
      
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//         {dummyAlbums.map((album) => (
//           <div key={album._id} className="bg-zinc-900/50 p-4 rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer border border-transparent hover:border-zinc-700">
//             <img src={album.coverImage} alt={album.title} className="w-full aspect-square object-cover rounded-md shadow-lg mb-4" />
//             <h3 className="font-bold text-white text-base truncate">{album.title}</h3>
//             <p className="text-zinc-400 text-sm truncate">{album.songCount} Tracks • {album.artistName}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }