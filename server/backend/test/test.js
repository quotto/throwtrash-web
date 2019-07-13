'use strict';
const assert = require('assert');
const rewire = require('rewire');
const target = rewire('../server.js');

describe('Function Test', ()=>{
    describe('getIdFromLineId', ()=>{
        const getIdFromLineId = target.__get__('getIdFromLineId');
        it('Exist lineId', async()=>{
            const id = await getIdFromLineId('amazon', 'b5d6ebfd8fd653a5ba324249b6c85e570ff03a632264c590f74fdd76cfb293f82b2686b5f56e1527b66f22235858d4d4');
            assert.equal(id, '14b73094-42b0-435b-91ce-cfaa3359b277');
        });
        it('Not exist lineId', async()=>{
            const id = await getIdFromLineId('amazon', 'NotExistlLneId');
            assert.equal(id, null);
        });
    });
    describe('createNewId', ()=>{
        const createNewId = target.__get__('createNewId');
        it('createNewId', async()=>{
            const id = await createNewId('amazon');
            assert(id);
        });
    });
});