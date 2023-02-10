<script lang="ts">
    import *  as L from 'leaflet'
    import html2canvas from 'html2canvas';
    import { onMount } from 'svelte';
  import { fromJSON } from 'postcss';
    let providers=[
        {tileProvider:"cartoDB.Voyager (nolabel)",links:"https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"},
        {tileProvider:"cartoDB.Dark (noLabel)",links:"https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"},
        {tileProvider:"cartoDB.Voyager",links:"https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"},
        {tileProvider:"cartoDB.Dark",links:"https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"},
        {tileProvider:"satellite",links:"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"},
        ]
    let providerSelection;
    let place="Delhi";
    let coordinates = false
    let lat = 28.6134
    let lon = 77.2184
    let startZoom = 3;
    let toZoom = 18;
    let rendering = false
    $: data=[0];
    let map:Map;
    onMount(()=>{
        map = L.map('map',{ zoomControl: false }).setView([28.6134 ,77.2184],startZoom);
        L.tileLayer(`https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png`, {
        minZoom:2,
        maxZoom: 19,
        attribution: '',
        }).addTo(map);
    })
    const initmap = (link:string)=>{
        let center = map.getCenter()
        map.off();
        map.remove();
        map = L.map('map',{ zoomControl: false }).setView([center.lat,center.lng],startZoom);
        L.tileLayer(`${link}`, {
        minZoom:2,
        maxZoom: 19,
        attribution: '',
        }).addTo(map);
    }
    const getdata=async()=>{
        const res=await fetch(`https://nominatim.openstreetmap.org/search?q=${place}&format=geojson&limit=1`)
        data=await res.json()
        await map.setView([data.features[0].geometry.coordinates[1],data.features[0].geometry.coordinates[0]],startZoom)
    }
    const render=async()=>{
        rendering =true
        let canvasarr = []
        let skip=false
        let min = startZoom
        let mincpy = min
        let max = toZoom
        let center = map.getCenter()
        let looper = setInterval(()=>{
            if(skip==false){
                if(min>max){
                clearInterval(looper)
                }
                map.setZoom(min)
                skip=true
                setTimeout(()=>{html2canvas(document.getElementById('map'),{allowTaint:true,useCORS:true}).then(
                    function(canvas){
                        canvasarr.push(canvas.toDataURL())
                        min++
                        skip=false
                    }
                )},200)
            }

        },200)
        let looper2 = setInterval(()=>{
            if(max<min){
                postdata(canvasarr,mincpy,max)
                clearInterval(looper2)
            }
        },500)
    }
    $: videosrc="";
    $:text = ""
    const postdata = async(canvasarr:TemplateStringsArray,min:Number,max:Number)=>{
        const response = await fetch(`/api/imgtovid`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify({array:canvasarr,
                                    place:place,
                                    min:min,
                                    max:max,
                                    height:document.querySelector('#map')?.clientHeight,
                                    width:document.querySelector('#map')?.clientWidth
                                })
        });
        text = await response.text()
        console.log(text)
        // let videoobj = await response.json()
        // videosrc = videoobj.src
        videosrc = "datalol"
        rendering = false
    }
</script>
<main>
    <div class="navbar bg-base-300 grid sm:max-w-fit place-items-center">
        <a class="btn btn-ghost normal-case text-3xl text-accent bg-red-900 border-accent" href="#chidam">zoomer</a>
    </div>
    <div class="maptype grid place-items-center sm:absolute sm:top-[0.5rem] sm:right-[0.5rem]">
        <div class="flex gap-4">
            <select bind:value={providerSelection} class="select select-accent text-accent focus:outline-none max-w-xs" on:change={()=>{initmap(providerSelection.links)}}>
                {#each providers as provider}
                    <option value={provider}>{provider.tileProvider}</option>
                {/each}
            </select>
            <label class="swap swap-rotate">
                <input type="checkbox" />
                <svg class="swap-on fill-current w-10 h-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"/></svg>
                <svg class="swap-off fill-current w-10 h-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"/></svg>
            </label>
        </div>
    </div>
    <div class="flex flex-col w-full lg:flex-row mt-4 mb-4">
        <div class="grid flex-grow h-20 card bg-base-300 rounded-box place-items-center">
            <div class="flexcontain flex gap-2">
            <div class="city input-group w-max">
                {#if coordinates}
                    <span class="bg-primary border-2 border-accent" ><div class="fade">(Lat, Lon)</div></span>
                {:else}
                    <span class="bg-primary border-2 border-accent"><div class="fade">City</div></span>
                {/if}
                <span class="swap bg-amber-900 active:rotate-180 border-y-2 border-accent" on:click={()=>{coordinates=!coordinates}}><i class="fa-solid fa-arrows-rotate" class:down={coordinates} class:up={!coordinates}></i></span>
                {#if !coordinates}
                    <input type="text" class="input border-2 border-accent" placeholder="enter the place" bind:value={place} on:input={getdata}>
                {:else}
                    <input type="text" class="input border-2 border-accent w-24" placeholder="lat" bind:value={lat}>
                    <input type="text" class="input border-2 border-accent w-24" placeholder="lon" bind:value={lon}>
                {/if}
            </div>
            </div>
        </div> 
        <div class="divider lg:divider-horizontal"></div> 
        <div class="grid flex-grow h-20 card bg-base-300 rounded-box place-items-center">
            <div class="zoominp input-group w-max ml-2">
                <span class="bg-primary border-2 border-accent">Zoom-from</span>
                <input type="text" class="input border-2 border-accent w-20" placeholder="start zoom level" bind:value={startZoom} on:input={getdata}>
                <span class="bg-primary border-2 border-accent">Zoom-halt</span>
                <input type="text" class="input border-2 border-accent w-20" placeholder="to zoom level" bind:value={toZoom} on:input={getdata}>
            </div>
        </div>
        <div class="divider  lg:divider-horizontal"></div> 
        <div class="grid flex-grow h-20 card bg-base-300 rounded-box place-items-center">
            <div class="city input-group w-max">
                <span class="bg-primary border-2 border-accent">FrameRate</span>
                <input type="number" class="input border-2 border-accent w-20">
            </div>
        </div>

    </div>
    {#if data[0]!=0}
        {data.features[0].geometry.coordinates}
    {/if}
    <div class="mapcontain grid place-items-center">
        <div class="map lg:h-96 md:h-52 aspect-[20/9] grid place-items-center" id="map" >

        </div>
    </div>
    <div class="render grid place-items-center mt-4">
        <button on:click={render} class="btn-success btn ">generate</button>
    </div>
    {#if videosrc}
        <div class="lol">{videosrc.slice(80,82)}</div>
        <div class="videocomp h-96 grid place-items-center">
            <video autoplay controls='true' loop class="h-full w-[43rem]" playsinline><source src={text} type='video/mp4'/></video>
            <video
                id="my-video"
                class="video-js"
                controls
                preload="auto"
                width="640"
                height="264"
            >
                <source src={text} type="video/mp4" />
                <p class="vjs-no-js">
                To view this video please enable JavaScript, and consider upgrading to a
                web browser that
                <a href="https://videojs.com/html5-video-support/" target="_blank"
                    >supports HTML5 video</a
                >
                </p>
            </video>
        </div>
    {/if}
</main>
<style>
    .fade{
        animation: slidein 3s;
    }
    @keyframes slidein{
        0%{
            opacity: 0;
        }
        100%{
            opacity: 1;
        }
    }
    .up{
        animation: spinanti 1s;
    }
    .down{
        animation: spin 1s ;
    }
    @keyframes spin{
        20%{
            transform: rotate(45eg);
        }
        80%{
            transform: rotate(80deg);
        }
        100%{
            transform: rotate(180deg);
        }
    }
    @keyframes spinanti{
        20%{
            transform: rotate(-45eg);
        }
        80%{
            transform: rotate(-80deg);
        }
        100%{
            transform: rotate(-180deg);
        }
    }
    .map{
        z-index: -99;
    }
    .rendering{
        position: absolute;
        top: 0%;
        left: 0%;
        display: block;
        background: #000000;
        width: 100%;
        height: 100%;
        opacity: 0.6;
        z-index: 99;
    }
</style>