/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        mytheme: {
        
        "primary": "#BB5321",
                
        "secondary": "#eb7442",
                
        "accent": "#ffaf7d",
                
        "neutral": "#ffffff",
                
        "base-100": "#000000",
                
        "info": "#3ABFF8",
                
        "success": "#4bb543",
                
        "warning": "#FBBD23",
                
        "error": "#ff3333",

        },
      },
      "retro",
      ],
    },

}
