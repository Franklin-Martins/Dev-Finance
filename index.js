/*Ao clicar para adicionar nova transação os modal é aberto e é possível
adicionar novas transações*/
const Modal = {
    open() {
        document
            .querySelector('.modal-overlay')
            .classList.add('active')
    },
    close() {
        document
            .querySelector('.modal-overlay')
            .classList
            .remove('active')
    }
}

// Array que contem os dados das transações já feitas
/*const transactions = [
    {
        description: 'Luz',
        amount: -50000,
        date: '23/01/2021'
    },
    {
        description: 'Website',
        amount: 500000,
        date: '23/01/2021'
    },
    {
        description: 'Internet',
        amount: -20000,
        date: '23/01/2021'
    },
]*/

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) ||
        []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions",
        JSON.stringify(transactions))
    }
}
//calculo das caixas de saídas e entradas totais juntamento com o total
const Transaction = {
    all:Storage.get(),
    //adiciona uma nova transação e recarrega a página
    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },
    //remove uma transação
    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },
    //calcula o valor total das entradas
    incomes() {
        let income = 0
        //pegar todas as transações
        //para cada transação
        Transaction.all.forEach((transaction) => {
            //se ela for maior que zero
            if (transaction.amount > 0) {
                //somar a uma variável e retornar a variável
                income += transaction.amount;
            }

        })

        return income
    },
    //retorna a maior entrada até o momento
    biggestIncome(){
        let biggestIncome = 0

        Transaction.all.forEach(transaction =>{
            if (transaction.amount > 0 && transaction.amount > biggestIncome){
                biggestIncome = transaction.amount
            }
        })

        return biggestIncome
    },
    //calcula o valor total das saídas
    expenses() {
        let expense = 0

        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount
            }
        })
        return expense
    },
    //retorna o maior valor de saída
    biggestExpense(){
        let biggestExpense = 0

        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0 && transaction.amount < biggestExpense) {
                biggestExpense = transaction.amount
            }
        })
        return biggestExpense
    },
    //Faz a ordenação da lista
    filter(){

    },
    //calcula o total que ainda resta
    total() {
        return Transaction.incomes() + Transaction.expenses()
    }
}

//Renderiza dos dados contidos no array transactions no HTML.
const DOM = {
    //seleciona o tbody da tabela para poder adicionar os data tables
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },


    innerHTMLTransaction(transaction, index) {
        //define se o css que vai entrar vai ser de income ou expense
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        //formata o valor da despesa ou ganho
        //console.log(transaction.amount)
        const amount = Utils.formatCurrency(transaction.amount)

        const html = ` 
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
        </td>
    `

        return html
    },

    updateBalance() {
        let backgroundTotal
        document.getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        
        document.getElementById('biggestIncomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.biggestIncome())

        document.getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())

        document.getElementById('biggestExpenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.biggestExpense())
        
        document.getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())

    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

//Utilizado para formatar os valores númericos
const Utils = {
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    },

    formatAmount(value) {
        value = (Number(value) * 100)

        return Math.round(value)
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateField() {
        const {description, amount,  date} = Form.getValues()
        
        if(description.trim() === "" || 
        amount.trim() === "" || 
        date.trim() ==="" ) {
            throw new Error("Por favor, preencha todos os campos")
        }
    },

    formatValues() {
        let {description, amount, date} = Form.getValues()
        
        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()
        

        try {

            // verificar se todas as informações foram preenchidas
            Form.validateField() 
            // formatar os dados para salvar
            const transaction = Form.formatValues()
            // salvar
            Transaction.add(transaction)
            // apagar os dados do formulário
            Form.clearFields()
            // modal feche
            Modal.close()
            
        } catch (error) {
            alert(error.message)

        }
        
    }

}


const App = {
    init() {
        //Para cada dado presente no array transactions chama o método
        //addTransaction do objeto DOM para poder renderizar os dados
        //no HTML.
        const type = document.getElementById("filter").selectedIndex;
        let aux = []

        Transaction.all.forEach((transaction, index) => {
            aux.push(transaction)
            //DOM.addTransaction(transaction, index)
        })
        //Ordena a listagem da tabela por nome
        if(document.getElementsByTagName("option")[type].value === "name"){
            aux.sort(function(a,b) {
                return a.description < b.description ? -1 : a.description > b.description ? 1 : 0;
            });
         
            aux.map((item)=>{
                console.log(item)
                DOM.addTransaction(item)
            })    
        }
        //Ordena a listagem da tabela por valor crescente
        if(document.getElementsByTagName("option")[type].value === "valueC"){
            aux.sort(function(a,b) {
                return a.amount < b.amount ? -1 : a.amount > b.amount ? 1 : 0;
            });
         
            aux.map((item)=>{
                console.log(item)
                DOM.addTransaction(item)
            })    
        }
        //Ordena a listagem da tabela por valor decrescente
        if(document.getElementsByTagName("option")[type].value === "valueD"){
            aux.sort(function(a,b) {
                return a.amount > b.amount ? -1 : a.amount < b.amount ? 1 : 0;
            });
         
            aux.map((item)=>{
                console.log(item)
                DOM.addTransaction(item)
            })    
        }
        if(document.getElementsByTagName("option")[type].value === "dateRecent"){
            aux.sort(function(a,b) {
                return a.date > b.date ? -1 : a.amount < b.date ? 1 : 0;
            });
         
            aux.map((item)=>{
                console.log(item)
                DOM.addTransaction(item)
            })    
        }

        if(document.getElementsByTagName("option")[type].value === "dateOld"){
            aux.sort(function(a,b) {
                return a.date < b.date ? -1 : a.amount > b.date ? 1 : 0;
            });
         
            aux.map((item)=>{
                console.log(item)
                DOM.addTransaction(item)
            })    
        }

        DOM.updateBalance()
        
        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    },

}


App.init()


