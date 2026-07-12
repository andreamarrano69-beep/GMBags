/* ============================================================
   GESTIONE ACCOUNT (login/registrazione/nav dinamica)
   Richiede supabase-config.js caricato prima di questo file.
   ============================================================ */

async function getSessionAndProfile() {
    if (!isSupabaseConfigured) return { session: null, profile: null };

    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return { session: null, profile: null };

    const { data: profile } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

    return { session, profile };
}

async function initAuthNav() {
    const navList = document.querySelector('.navbar-nav');
    if (!navList || !isSupabaseConfigured) return;

    const { session, profile } = await getSessionAndProfile();

    if (session) {
        const liAccount = document.createElement('li');
        liAccount.innerHTML = '<a href="account.html" class="nav-link">Il Mio Account</a>';
        navList.appendChild(liAccount);

        if (profile && profile.is_admin) {
            const liAdmin = document.createElement('li');
            liAdmin.innerHTML = '<a href="admin.html" class="nav-link">Admin</a>';
            navList.appendChild(liAdmin);
        }

        const liLogout = document.createElement('li');
        liLogout.innerHTML = '<a href="#" class="nav-link" id="logoutLink">Esci</a>';
        navList.appendChild(liLogout);

        document.getElementById('logoutLink').addEventListener('click', async (e) => {
            e.preventDefault();
            await supabaseClient.auth.signOut();
            window.location.href = 'index.html';
        });
    } else {
        const liLogin = document.createElement('li');
        liLogin.innerHTML = '<a href="login.html" class="nav-link">Accedi</a>';
        navList.appendChild(liLogin);
    }
}

// Da usare nelle pagine riservate agli utenti loggati (es. account.html)
async function requireLogin(redirectTo = 'login.html') {
    if (!isSupabaseConfigured) {
        alert('Il sistema di account non è ancora attivo su questo sito.');
        window.location.href = 'index.html';
        return null;
    }

    const result = await getSessionAndProfile();
    if (!result.session) {
        window.location.href = redirectTo;
        return null;
    }
    return result;
}

// Da usare nella pagina admin.html
async function requireAdmin() {
    const result = await requireLogin('login.html');
    if (!result) return null;

    if (!result.profile || !result.profile.is_admin) {
        alert('Accesso riservato agli amministratori.');
        window.location.href = 'index.html';
        return null;
    }
    return result;
}

document.addEventListener('DOMContentLoaded', () => {
    initAuthNav();
});
