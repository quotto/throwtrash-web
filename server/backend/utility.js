const Twitter = require('twitter')

const JSTOffset = 60 * 9 * 60 * 1000; // JST時間を求めるためのオフセット

function calculateJSTTime() {
    var localdt = new Date(); // 実行サーバのローカル時間
    var jsttime = localdt.getTime() + (localdt.getTimezoneOffset() * 60 * 1000) + JSTOffset;
    var dt = new Date(jsttime);
    return dt;
}

exports.check_schedule = (data)=>{
    const result = []
    const dt = calculateJSTTime()
    const trashes = JSON.parse(data)
    console.log(typeof(trashes))
    trashes.forEach((trash,index,arr) => {
        const type =  trash['type']
        console.log(`checkschedule:${type}`)
        trash['schedules'].some((schedule)=>{
            if(schedule['type'] === 'weekday') {
                if(Number(schedule['value']) === dt.getDay()) {
                    console.log(`hit weekday:${schedule['value']}`)
                    result.push(type)
                    return true
                }
            } else if(schedule['type'] === 'biweek') {
                var matches = schedule['value'].match(/(\d)-(\d)/)
                var weekday = matches[1]
                var turn = matches[2]

                // 現在何週目かを求める
                var nowturn = 0
                var targetdate = dt.getDate()
                while(targetdate > 0) {
                    nowturn += 1
                    targetdate -= 7
                }

                if(Number(weekday) === dt.getDay() && Number(turn) === nowturn) {
                    console.log(`hit biweek:${schedule['value']}`)
                    result.push(type)
                    return true
                }
            } else if(schedule['type'] === 'month') {
                if(dt.getDate() === Number(schedule['value'])) {
                    console.log(`hit month:${schedule['value']}`)
                    result.push(type)
                    return true
                }
            }
        })
    })
    return result.filter((value,index,self)=>{
        return self.indexOf(value)===index
    })
}
