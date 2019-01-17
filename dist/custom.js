
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
        const lookContainer = document.getElementById('look-detail')
        const TAGE_STORAGE_KEY = 'tags';

        // chrome 接口 操作
        class ChromeHandler {
            getStorage(key,fn){ chrome.storage.local.get(key,fn) };
            sendChromeNotification(type='basic',id,title,message,fn){
                chrome.notifications.create('123123',{type:'basic',title:'哈哈哈',iconUrl:'./assets/img/icon.jpg',message:'asdasd'},fn)
            }
            setStorage(key,data){
                chrome.storage.local.set({[key]:data},(res) => {
                    msgContainer.removeAttribute('hidden')
                    setTimeout(()=>{
                        msgContainer.setAttribute('hidden','')
                    },1500)
                })
            }
            getSelected(fn){
                chrome.tabs.getSelected((res)=>{
                    fn(res)
                })
            }
        }

        // 提示消息
        class Message {
            constructor(options){
                const defaultOptions = {
                    isNotificationChrome: true,
                    duration: 1000,
                    direction:'top'
                }
                options = options ? Object.assign(defaultOptions,options) : defaultOptions
                for (let i = 0; i < Object.keys(options).length; i++) {
                    let optionKey = options[i];
                    this[optionKey] = options[optionKey]
                }
            }
            getElement(msg){
                const ele = document.createElement('div');
                const innerQL = `
                     <div class="dialog">
                        <span class="dialog-msg"> ${msg} </span>
                    </div>
                `
                ele.innerHTML = innerQL.trim();
                ele.close = this.close(ele);
                return ele;
            }
            open(msg,type) {
                const ele = this.getElement(msg)
                ele.addEventListener('transitioned', ele.close)
            }
            close(ele){ setTimeout(()=>{ ele.parentNode.removeChild(ele) }, this.duration) }
            /* 触发 */
            success(msg){
                this.open(msg,'success')
            }
            error(msg){this.open(msg,'error')}
        }

        const chromeHandler = new ChromeHandler()
        const message = new Message();
        const getHistoryListQL = data => {
            let str = '',
                childrensQL = '';
            const keys = Object.keys(data)
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i]
                let contentlist = data[key]
                for (let j = 0; j < contentlist.length; j++) {
                    let obj = contentlist[j];
                    childrensQL+=`<li><a title="${obj.note}" href="${obj.url}" target="_blank"> ${obj.name} </a></li>`
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
                childrensQL = '';
                str+=liQL
            }
            return str
        }
        const lookHistory = () => {
            handleContainer.style.display = 'none';
            lookContainer.style.display = 'block';
            const btnQL = `<span class="clear"><button class="reset-form right btn j-return-top" role="button"> 返回 </button> </span>`
            chromeHandler.getStorage(TAGE_STORAGE_KEY,(data) => {
                data = data[TAGE_STORAGE_KEY];
                let listQL = getHistoryListQL(data)
                lookContainer.innerHTML = `<ul class="tab-list" role="tablist">${btnQL}${listQL}</ul>`;
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
        const starProject = (e) => {
            try {
                chromeHandler.getStorage(TAGE_STORAGE_KEY,(res)=>{
                    res = res[TAGE_STORAGE_KEY] || {};
                    if (!type) { message.error('请选择类型'); return; }
                    if (!urlInput.value) { message.error('请填写链接'); return; }
                    const prevTags = res[type] || [];
                    prevTags.push({
                        name:nameInput.value,
                        url:urlInput.value,
                        note:noteInput.value
                    })
                    res[type] = prevTags
                    chromeHandler.setStorage(TAGE_STORAGE_KEY,res)
                })
            } catch (err) {  console.error(err); }
        }

        chromeHandler.getSelected((res)=>{
            const url = res.url;
            urlInput.value = url;
            if (url.indexOf('https://github.com') !== -1) {
                titleEle.innerText = 'star this project of github? '
            }
        })

        const typeList = [
            {name:'组织',id:'',img:''},
            {name:'web框架',id:'',img:''},
            {name:'Java',id:'',img:''},
            {name:'node',id:'',img:''},
            {name:'博客或文章',id:'',img:''},
            {name:'UI库',id:'',img:''},
            {name:'Vue',id:'',img:''},
            {name:'React',id:'',img:''},
            {name:'HTML',id:'',img:''},
            {name:'css',id:'',img:''},
            {name:'源码计划',id:'',img:''},
            {name:'js 源码',id:'',img:''},
            {name:'React Native',id:'', img:''},
            {name:'NB SOME ONE',id:'', img:''},
            {name:'BLOG',id:'', img:''},
            {name:'值得',id:'', img:''}
        ]

        let type = null;
        //初始化类型tag
        for (let i = 0; i < typeList.length; i++) {
            let typeObject = typeList[i];
            const li = document.createElement('LI')
            li.innerHTML = `
                <label>
                    <input type="radio" class="tag-radio" data-type="${typeObject.name}" />
                    ${typeObject.name}
                </label>
            `
            typeListEle.appendChild(li)
        }
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
        starBtn.addEventListener('click',starProject)
        lookHistoryEle.addEventListener('click', lookHistory)
    })
})()