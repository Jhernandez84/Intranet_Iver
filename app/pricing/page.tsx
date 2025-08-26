// "use client";

export default function PricingPage() {
  return (
    <div>
      <h1>Dashboard de finanzas</h1>
      <h1>Reportes</h1>
    </div>
  );
}

// interface PricingCardSize {
//   height: number;
//   width: number;
// }

// interface PricinPageProps {
//   size: PricingCardSize;
// }
// export default function PricingPage({ size }: PricinPageProps) {
//   const cardStyle = {
//     height: `${size?.height}px`,
//     width: `${size?.width}px`,
//   };

//   return (
//     <div>
//       <div
//         style={cardStyle}
//         className="max-w-sm rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg sm:p-8 dark:border-gray-700 dark:bg-gray-800"
//       >
//         <h5 className="mb-4 text-xl font-medium text-gray-500 dark:text-gray-400">
//           Standard plan
//         </h5>
//         <div className="flex items-baseline text-gray-900 dark:text-white">
//           <span className="text-3xl font-semibold">$</span>
//           <span className="text-5xl font-extrabold tracking-tight">49</span>
//           <span className="ms-1 text-xl font-normal text-gray-500 dark:text-gray-400">
//             /month
//           </span>
//         </div>
//         {/* ... resto del contenido igual ... */}
//         <button
//           type="button"
//           className="inline-flex w-full justify-center rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-200 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-900"
//         >
//           Choose plan
//         </button>
//       </div>
//     </div>
//   );
// }
