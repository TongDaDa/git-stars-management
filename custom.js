(()=>{
    addEventListener('load',() => {
        const location = window.location;
        const titleEle = document.querySelector('.alert-title')
        const inputEles = document.querySelectorAll('.input-primary')
        const urlInput = document.querySelector('.urlInput')
        const nameInput = document.querySelector('.nameInput')
        const noteInput = document.querySelector('.noteInput')
        const starBtn = document.querySelector('.start-btn')
        const msgContainer = document.querySelector('.msg-container')
        const lookHistoryEle = document.querySelector('.look-history')
        const typeListEle = document.querySelector('.type-list')
        const handleContainer = document.querySelector('.handle')

        const listTabList = document.querySelector('.tab-list')
        const lookContainer = document.getElementById('look-detail')
        let currentWindow = null;

        const getStorage = (fn)=>{
            chrome.storage.local.get('tags',fn)
        }

        const lookHistory = () => {
            handleContainer.style.display = 'none';
            lookContainer.style.display = 'block';
            const btnQL = `<span class="clear"><button class="reset-form right btn j-return-top" role="button"> 返回 </button> </span>`
            getStorage((data) => {
                data = data.tags;
                let str = ''
                let childrensQL = ''
                const keys = Object.keys(data)
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i]
                    let contentlist = data[key]
                    for (let j = 0; j < contentlist.length; j++) {
                        let obj = contentlist[j];
                        childrensQL+=`<li><a href="${obj.href}" title="${obj.note}"> ${obj.name} </a></li>`
                    }
                    const liQL = `
                       <li role="tab">
                            <h2 class="tab-title" aria-label="个人项目">
                                ${key}
                            </h2>
                            <div class="tab-content" role="contentinfo" style="display: none;">
                                <ul>${childrensQL}</ul>
                            </div>
                        </li>
                    `.trim()
                    str+=liQL
                }
                lookContainer.innerHTML = `<ul class="tab-list" role="tablist">${btnQL} ${str}</ul>`;
                const listTabTitle = Array.from(document.getElementsByClassName('tab-title'))
                const listTabContent = Array.from(document.getElementsByClassName('tab-content'))

                //添加事件
                document.querySelector('.j-return-top').addEventListener('click',()=>{
                    handleContainer.style.display = 'block';
                    lookContainer.style.display = 'none';
                })

                for (let i = 0; i < listTabTitle.length; i++) {
                    listTabTitle[i].addEventListener('click',(e) => {
                        let contentEle = listTabContent[i]
                        const displaySty = contentEle.style.display;
                        if (displaySty === 'block') {
                            contentEle.style.display = 'none'
                        } else {
                            contentEle.style.display = 'block'
                        }
                    })
                }

            })
        }

        chrome.tabs.getSelected((res)=>{
            const url = res.url;
            urlInput.value = url;
            if (url.indexOf('https://github.com') !== -1) {
                titleEle.innerText = 'star this project of github? '
            }
        })

        lookHistoryEle.addEventListener('click', lookHistory)

        const typeList = [
            {name:'组织',id:'',img:''},
            {name:'web框架',id:'',img:''},
            {name:'Java',id:'',img:''},
            {name:'node',id:'',img:''},
            {name:'博客或文章',id:'',img:''},
            {name:'UI库',id:'',img:''},
            {name:'Vue',id:'',img:''},
            {name:'React',id:'',img:''},
        ]

        // 提示消息
        class Message {
            constructor(){
                this.queue = []
                this.duration = 1000;
            }
            getElement(msg){
                const ele = document.createElement('div');
                const innerQL = `
                     <div class="dialog">
                        <span class="dialog-msg"> ${msg} </span>
                    </div>
                `
                ele.innerHTML = innerQL.trim();
                ele.closed = ()=>{
                    setTimeout(()=>{ ele.parentNode.removeChild(ele) },this.duration)
                }
                return ele;
            }

            open(msg,type) {
                const ele = this.getElement(msg)
                this.queue.push({
                    duration: 1000,
                    ele
                })
                ele.addEventListener('transitioned', ele.closed)
            }
            /* 触发 */
            success(msg){this.open(msg,'success')}
            error(msg){this.open(msg,'error')}
        }

        const message = new Message();
        let type = null;

        //初始化类型tag
        for (let i = 0; i < typeList.length; i++) {
            let obj = typeList[i];
            const li = document.createElement('LI')
            li.innerHTML = `
                <label>
                    <input type="radio" class="tag-radio" data-type="${obj.name}" />
                    ${obj.name}
                </label>
            `
            typeListEle.appendChild(li)
        }

        starBtn.addEventListener('click',(e) => {
            try {
                getStorage((res)=>{
                    res = res.tags || {};
                    if (!type) { message.error('请选择类型'); return; }
                    const prevTags = res[type] || [];
                    if (!urlInput.value) { message.error('请填写链接'); return; }
                    prevTags.push({
                        name:noteInput.value,
                        url:urlInput.value,
                        note:nameInput.value
                    })
                    res[type] = prevTags
                    chrome.storage.local.set({tags:res},(res) => {
                        msgContainer.removeAttribute('hidden')
                        setTimeout(()=>{
                            msgContainer.setAttribute('hidden','')
                        },1500)
                    })
                })
            } catch (err) {
                console.log(err);
            }
        })

        for (let i = 0; i < inputEles.length; i++) {
            let inputEle = inputEles[i];
            inputEle.addEventListener('focus',(e)=>{
                e.currentTarget.classList.add('input-border-focused')
            })
            if (inputEle.dataset.type === 'url') {
                inputEle.value = location.href;
                inputEle.focus();
            }
            inputEle.addEventListener('blur',(e)=>{
                e.currentTarget.classList.remove('input-border-focused')
            })
        }

        const radio_eles = document.querySelectorAll('.tag-radio');

        for (let i = 0; i < radio_eles.length; i++) {
            let radio = radio_eles[i];
            radio.addEventListener('click',(e) => {
                type = radio.dataset.type
                e.currentTarget.checked = true;
                for (let j = 0; j < radio_eles.length; j++) {
                    if (radio_eles[j] === radio) continue;
                    radio_eles[j].checked = false;
                }
            })
        }
    })
})()