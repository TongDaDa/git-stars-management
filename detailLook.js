((w,fn)=>{
    w.addEventListener('DOMContentLoaded',fn)
})(window,()=>{
    console.log('1');
    addEventListener('message',(event) => {
        console.log(event.source);
        console.log(event);
    })
})