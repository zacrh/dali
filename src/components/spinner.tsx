export const Spinner = ({ size = 8, borderSize = 4, spinnerColor = "primary", railColor = "primaryhover" }) => (

    <div className="relative flex items-center justify-center">
    <div
      className={`absolute w-${size} h-${size} border-4 border-${borderSize} border-primaryhover rounded-full`}
    ></div>
    <div
      className={`w-${size} h-${size} border-4 border-${borderSize} border-primary border-t-transparent border-b-transparent border-r-transparent rounded-full animate-spin`}
    ></div>
  </div>
  );
  