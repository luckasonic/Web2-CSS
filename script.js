document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'shoppingListProducts';

    // Load products from local storage or use initial products
    const storedProducts = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const initialProducts = storedProducts || [
        { name: 'Помідори', quantity: 2, bought: true },
        { name: 'Печиво', quantity: 2, bought: false },
        { name: 'Сир', quantity: 1, bought: false }
    ];

    // Function to add a product to the list
    function addProduct(name, quantity = 1, bought = false) {
        const productHTML = `
            <div class="product">
                <input type="text" class="name ${bought ? 'crossed' : ''}" value="${name}" ${bought ? 'disabled' : ''}>
                <div class="buttons">
                    <button class="change-quantity minus ${quantity === 1 ? 'inactive' : ''}" ${quantity === 1 ? 'disabled' : ''} ${bought ? 'style="visibility:hidden;"' : ''} data-tooltip="Зменшити кількість">-</button>
                    <div class="number">
                        <button class="num">${quantity}</button>
                    </div>
                    <button class="change-quantity plus" ${bought ? 'style="visibility:hidden;"' : ''} data-tooltip="Збільшити кількість">+</button>
                </div>
                <div class="status">
                    <button class="bought bought-status" data-tooltip="Позначити ${!bought ? 'купленим' : 'не купленим'}">${bought ? 'Не куплено' : 'Куплено'}</button>
                    ${bought ? '' : '<button class="remove" data-tooltip="Прибрати товар">x</button>'}
                </div>
            </div>
        `;

        const productPicker = document.querySelector('.product-picker');
        productPicker.insertAdjacentHTML('beforeend', productHTML);
        updateEventListeners();
        updateSummary();
    }

    // Function to save products to local storage
    function saveProducts() {
        const products = Array.from(document.querySelectorAll('.product')).map(product => {
            const name = product.querySelector('.name').value;
            const quantity = parseInt(product.querySelector('.num').textContent);
            const bought = product.querySelector('.bought-status').textContent.trim() === 'Не куплено';
            return { name, quantity, bought };
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    }

    // Function to toggle the bought status of a product
    function toggleBoughtStatus(event) {
        const button = event.target;
        const productElement = button.closest('.product');
        const nameInput = productElement.querySelector('.name');
        const plusButton = productElement.querySelector('.plus');
        const minusButton = productElement.querySelector('.minus');
        const numElement = productElement.querySelector('.num');
        const isBought = button.textContent.trim() === 'Куплено';
        const removeButton = productElement.querySelector('.remove');

        if (isBought) {
            plusButton.style.visibility = 'hidden';
            minusButton.style.visibility = 'hidden';
            nameInput.classList.add('crossed');
            nameInput.disabled = true;
        } else {
            if (removeButton) removeButton.style.display = "flex";
            plusButton.style.visibility = 'visible';
            minusButton.style.visibility = 'visible';
            nameInput.classList.remove('crossed');
            nameInput.disabled = false;
        }

        button.textContent = isBought ? 'Не куплено' : 'Куплено';
        button.setAttribute('data-tooltip', isBought ? 'Позначити купленим' : 'Позначити не купленим');

        if (isBought) {
            if (removeButton) removeButton.style.display = "none";
        } else {
            const statusDiv = productElement.querySelector('.status');
            if (!productElement.querySelector('.remove')) {
                statusDiv.insertAdjacentHTML('beforeend', '<button class="remove" data-tooltip="Прибрати товар">x</button>');
            }
        }

        saveProducts();
        updateSummary();
    }

    // Function to change the quantity of a product
    function changeQuantity(event) {
        const isIncrement = event.target.classList.contains('plus');
        const numElement = event.target.parentElement.querySelector('.num');
        const minusButton = event.target.parentElement.querySelector('.minus');
        let quantity = parseInt(numElement.textContent);

        if (isIncrement) {
            quantity++;
        } else {
            quantity = quantity > 1 ? quantity - 1 : quantity;
        }

        numElement.textContent = quantity;

        if (quantity === 1) {
            minusButton.classList.add('inactive');
            minusButton.disabled = true;
        } else {
            minusButton.classList.remove('inactive');
            minusButton.disabled = false;
        }

        saveProducts();
        updateSummary();
    }

    // Function to handle form submission
    function handleFormSubmit(event) {
        event.preventDefault();
        const input = document.querySelector('.add-input');
        const productName = input.value.trim();
        if (productName === "") return;
        addProduct(productName);
        input.value = '';
        input.focus();
        saveProducts();
    }

    // Function to remove a product from the list
    function removeProduct(event) {
        const productElement = event.target.closest('.product');
        productElement.remove();
        saveProducts();
        updateSummary();
    }

    // Function to handle name editing
    function handleNameEdit(event) {
        const input = event.target;
        input.disabled = false;
        input.focus();
    }

    // Function to handle name change
    function handleNameChange(event) {
        saveProducts();
        updateSummary();
    }

    // Function to update the summary of remaining and purchased products
    function updateSummary() {
        const remainingContainer = document.querySelector('.remaining');
        const purchasedContainer = document.querySelector('.purchased');

        remainingContainer.innerHTML = '';
        purchasedContainer.innerHTML = '';

        document.querySelectorAll('.product').forEach(product => {
            const productName = product.querySelector('.name').value;
            const quantity = product.querySelector('.num').textContent;
            const isBought = product.querySelector('.bought-status').textContent.trim() === 'Не куплено';

            const productItemHTML = `<span class="product-item">${productName} <span class="amount">${quantity}</span></span>`;

            if (isBought) {
                purchasedContainer.insertAdjacentHTML('beforeend', productItemHTML);
            } else {
                remainingContainer.insertAdjacentHTML('beforeend', productItemHTML);
            }
        });
    }

    // Function to update event listeners for dynamic elements
    function updateEventListeners() {
        document.querySelectorAll('.change-quantity.plus').forEach(button => {
            button.removeEventListener('click', changeQuantity);
            button.addEventListener('click', changeQuantity);
        });

        document.querySelectorAll('.change-quantity.minus').forEach(button => {
            button.removeEventListener('click', changeQuantity);
            button.addEventListener('click', changeQuantity);
        });

        document.querySelectorAll('.bought-status').forEach(button => {
            button.removeEventListener('click', toggleBoughtStatus);
            button.addEventListener('click', toggleBoughtStatus);
        });

        document.querySelectorAll('.remove').forEach(button => {
            button.removeEventListener('click', removeProduct);
            button.addEventListener('click', removeProduct);
        });

        document.querySelectorAll('.name').forEach(input => {
            input.removeEventListener('click', handleNameEdit);
            input.addEventListener('click', handleNameEdit);

            input.removeEventListener('blur', handleNameChange);
            input.addEventListener('blur', handleNameChange);
        });
    }

    // Initial setup
    document.querySelector('.adder').addEventListener('submit', handleFormSubmit);
    initialProducts.forEach(product => addProduct(product.name, product.quantity, product.bought));
    updateEventListeners();
    updateSummary();
});
