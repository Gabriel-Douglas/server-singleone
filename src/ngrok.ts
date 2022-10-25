import Ngrok from "ngrok";
// require('dotenv-safe').config();

export default async () =>{
    const token = await Ngrok.authtoken('2FLzRztGP8ie7iThDWpqVtAKSBW_7qWC5yvdbWw42jCZkfMLP')
    const urlNgrok = await Ngrok.connect({addr: 3001});
    const api = Ngrok.getApi();
    // const tunnel = await api.startTunnel({id: tunnels[0].id});
    return urlNgrok;
}
