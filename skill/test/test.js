var assert = require('assert')
const Client = require('../client.js')
const sinon = require('sinon')

const rightAccessToken='50f53d89-3ee7-4de0-bb14-93d623674b20'

describe('Client',function(){
    describe('calculateJSTTime',function(){
        it('今日の日付',function(){
            var dt = Client.calculateJSTTime(0)
            assert.equal(dt.getDate(),(new Date()).getDate())
            assert.equal(dt.getDay(),(new Date()).getDay())
        })

        it('明日の日付',function(){
            var dt = Client.calculateJSTTime(1)
            assert.equal(dt.getDate(),(new Date()).getDate()+1)
            assert.equal(dt.getDay(),(new Date()).getDay()+1)
        })
    })

    describe('check_schedule',function(){
        const stub = sinon.stub(Client,'calculateJSTTime')
        const testdata = { "Item": { "description": '[ { "type": "burn", "schedules": [ { "type": "weekday", "value": "3" }, { "type": "weekday", "value": "6" }, { "type": "none", "value": "" } ] }, { "type": "plastic", "schedules": [ { "type": "weekday", "value": "1" }, { "type": "none", "value": "" }, { "type": "none", "value": "" } ] }, { "type": "paper", "schedules": [ { "type": "none", "value": "" }, { "type": "biweek", "value": "1-2" }, { "type": "none", "value": "" } ]}, { "type": "bottole", "schedules": [ { "type": "weekday", "value": "4" }, { "type": "none", "value": "" }, { "type": "none", "value": "" } ] }, { "type": "petbottle", "schedules": [ { "type": "weekday", "value": "4" }, { "type": "month", "value": "11" }, { "type": "none", "value": "" } ] } ]'} }
        it('weekday',function(){
            stub.returns(new Date('2018/03/01'))

            var result = Client.check_schedule(testdata,0)
            assert.equal(result.length,2)
            assert.equal("bottole",result[0])
            assert.equal("petbottle",result[1])
        })
        it('biweek',function(){
            stub.returns(new Date('2018/03/12')) //第2月曜日
            var result = Client.check_schedule(testdata,0)
            assert.equal(2,result.length)
            assert.equal("plastic",result[0])
            assert.equal("paper",result[1])
        })
        it('month',function(){
            stub.returns(new Date('2018/03/11')) //毎月11日
            var result = Client.check_schedule(testdata,0)
            assert.equal(1,result.length)
            assert.equal("petbottle",result[0])
        })
        it('none',function(){
            stub.returns(new Date('2018/03/04')) //該当パターンなし
            var result = Client.check_schedule(testdata,0)
            assert.equal(0,result.length)
        })
        stub.restore()
    })
    describe('getEnableTrashes',function(){
        it('不正なパラメータ',function(done){
            Client.getEnableTrashes({test:"aaa"},0).then((response)=>{},(error)=>{
                assert.equal(error,"情報の取得に失敗しました。スキル開発者にお問い合わせください。")
                done()
            })
        })
        it('未登録のuuid',function(done){
            Client.getEnableTrashes("1439d8b1-b41e-45f9-9afc-ecdfdaea1d83",0).then((response)=>{},(error)=>{
                assert.equal(error,"登録情報が見つかりません。アカウントリンクを行ってから再度お試しください。")
                done()
            })
        })
    })
    describe('getEnableTrashesByWeekday',function(){
        it('日曜日',function(done){
            Client.getEnableTrashesByWeekday(rightAccessToken,0).then((response)=>{
                assert.equal(response.length,0)
                done()
            })
        })
        it('水曜日',function(done){
            Client.getEnableTrashesByWeekday(rightAccessToken,3).then((response)=>{
                assert.equal(response.length,1)
                assert.equal('burn',response[0])
                done()
            })
        })
        it('土曜日',function(done){
            Client.getEnableTrashesByWeekday(rightAccessToken,6).then((response)=>{
                assert.equal(response.length,1)
                done()
            })
        })
    })
})
