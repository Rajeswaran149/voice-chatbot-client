export const  localUrl ="http://localhost:5000";
export const  productionUrl ="https://voice-chatbot-server.vercel.app";


export const getBaseUrl = () => {
    // Check if the app is running in production mode
    return process.env.NODE_ENV === 'production' ? productionUrl : localUrl;
  };
  