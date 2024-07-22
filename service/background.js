import {T5ForConditionalGeneration, T5Tokenizer} from transformers 

async function loadModel(){
    const tokenizer = await T5Tokenizer.from_pretrained('j5ng/et5-typos-corrector')
    const model = await T5ForConditionalGeneration.from_pretrained('j5ng/et5-typos-corrector')
    const device = "cpu";
}

// loadModel();

