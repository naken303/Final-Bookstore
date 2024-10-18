function searchUsers() {
    const query = document.getElementById('searchInput').value;
    console.log(query)
    fetch(`/user/search?query=${query}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        const tableBody = document.querySelector('tbody');
        tableBody.innerHTML = '';

        if (data.length > 0) {
            data.forEach(user => {
                tableBody.innerHTML += `
                    <tr>
                        <td>${user._id}</td>
                        <td>${user.firstname}</td>
                        <td>${user.lastname}</td>
                        <td>${user.email}</td>
                        <td class="tools">
                            <a href="#" class="edit-btn" data-user-id="${user._id}"><i class="fa-solid fa-pen"></i></a>
                            <a href="#" class="delete-btn" data-user-id="${user._id}"><i class="fa-solid fa-trash"></i></a>
                        </td>
                    </tr>
                `;
            });
            addEditListeners();
            addDeleteListeners();
        } else {
            tableBody.innerHTML = '<tr><td colspan="5">No users found</td></tr>';
        }
    })
    .catch(error => console.error('Error:', error));
}

// Function to fetch user details and open the edit user modal
function addEditListeners() {
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();

            const userId = this.getAttribute('data-user-id');

            // Fetch the user data from the server
            fetch(`/user/${userId}/edit`)
                .then(response => response.json())
                .then(user => {
                    // Populate the form with the user's current data
                    document.getElementById('userFirstname').value = user.firstname;
                    document.getElementById('userLastname').value = user.lastname;
                    document.getElementById('userEmail').value = user.email;
                    document.getElementById('userRole').value = user.role;

                    // Update the form action to the correct user edit route
                    document.getElementById('editUserForm').setAttribute('action', `/user/${userId}/edit`);

                    // Open the modal
                    openEditUserModal();
                })
                .catch(error => console.error('Error fetching user details:', error));
        });
    });
}

function addDeleteListeners() {
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();

            const userId = this.getAttribute('data-user-id');

            // Confirm if the user really wants to delete the user
            if (confirm('Are you sure you want to delete this user?')) {
                // Send a DELETE request to the server to delete the user
                fetch(`/user/${userId}/delete`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.message === 'User deleted successfully') {
                        // Optionally, remove the user row from the table without refreshing the page
                        const row = button.closest('tr');
                        row.remove(); // Remove the row from the table
                    } else {
                        alert('Error deleting user');
                    }
                })
                .catch(error => console.error('Error:', error));
            }
        });
    });
}

// Function to open the edit user modal
function openEditUserModal() {
    const modal = document.getElementById('addNewBook');
    modal.classList.add('active');
}

// Function to close the edit user modal
function closeEditUserModal() {
    const modal = document.getElementById('addNewBook');
    modal.classList.remove('active');
}

// Call the addEditListeners function when the DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
    addEditListeners();
});

// Function to open the edit user modal
function openEditUserModal() {
    const modal = document.getElementById('addNewBook');
    modal.classList.add('active');
}

// Function to close the edit user modal
function closeEditUserModal() {
    const modal = document.getElementById('addNewBook');
    modal.classList.remove('active');
}

// Call the addEditListeners function when the DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
    addEditListeners();
    addDeleteListeners();
});