var mapFn = [
    {
        say:function(){
            console.log('say');
        }
    },
    {
        jump:function(){
            console.log('jump');
        }
    }
]
function transfer(origin,key){
    var test = origin.map(data=>data[key]).filter(_ => {
        console.log(_);
        return _
    })
    console.log(test);
}

transfer(mapFn,'jump')