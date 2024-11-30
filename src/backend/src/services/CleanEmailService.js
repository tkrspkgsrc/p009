const BaseService = require("./BaseService");

class CleanEmailService extends BaseService {
    static NAMED_RULES = {
        // For some providers, dots don't matter
        dots_dont_matter: {
            name: 'dots_dont_matter',
            description: 'Dots don\'t matter',
            rule: ({ eml }) => {
                eml.local = eml.local.replace(/\./g, '');
            },
        },
        remove_subaddressing: {
            name: 'remove_subaddressing',
            description: 'Remove subaddressing',
            rule: ({ eml }) => {
                eml.local = eml.local.split('+')[0];
            },
        },
    };
    static PROVIDERS = {
        gmail: {
            name: 'gmail',
            description: 'Gmail',
            rules: ['dots_dont_matter'],
        },
        icloud: {
            name: 'icloud',
            description: 'iCloud',
            rules: ['dots_dont_matter'],
        },
        yahoo: {
            name: 'yahoo',
            description: 'Yahoo',
            // Yahoo doesn't allow subaddressing, which would be a non-issue,
            // except Yahoo allows '+' symbols in the primary email address.
            rmrules: ['remove_subaddressing'],
        },
    };
    // Service providers may have multiple subdomains a user can choose
    static DOMAIN_TO_PROVIDER = {
        'gmail.com': 'gmail',
        'yahoo.com': 'yahoo',
        'yahoo.co.uk': 'yahoo',
        'yahoo.ca': 'yahoo',
        'yahoo.com.au': 'yahoo',
        'icloud.com': 'icloud',
        'me.com': 'icloud',
        'mac.com': 'icloud',
    };
    // Service providers may allow the same primary email address to be
    // used with different domains
    static DOMAIN_NONDISTINCT = {
        'googlemail.com': 'gmail.com',
    }
    _construct () {
        this.named_rules = this.constructor.NAMED_RULES;
        this.providers = this.constructor.PROVIDERS;
        this.domain_to_provider = this.constructor.DOMAIN_TO_PROVIDER;
        this.domain_nondistinct = this.constructor.DOMAIN_NONDISTINCT;
    }

    clean (email) {
        const eml = (() => {
            const [local, domain] = email.split('@');
            return { local, domain };
        })();

        if ( this.domain_nondistinct[eml.domain] ) {
            eml.domain = this.domain_nondistinct[eml.domain];
        }

        const rules = [
            'remove_subaddressing',
        ];

        const provider = this.domain_to_provider[eml.domain] || eml.domain;
        const provider_info = this.providers[provider];
        if ( provider_info ) {
            provider_info.rules = provider_info.rules || [];
            provider_info.rmrules = provider_info.rmrules || [];

            for ( const rule_name of provider_info.rules ) {
                rules.push(rule_name);
            }

            for ( const rule_name of provider_info.rmrules ) {
                const idx = rules.indexOf(rule_name);
                if ( idx !== -1 ) {
                    rules.splice(idx, 1);
                }
            }
        }

        for ( const rule_name of rules ) {
            const rule = this.named_rules[rule_name];
            rule.rule({ eml });
        }

        return eml.local + '@' + eml.domain;
    }

    _test ({ assert }) {
        const cases = [
            {
                email: 'bob.ross+happy-clouds@googlemail.com',
                expected: 'bobross@gmail.com',
            },
            {
                email: 'under.rated+email-service@yahoo.com',
                expected: 'under.rated+email-service@yahoo.com',
            },
            {
                email: 'the-absolute+best@protonmail.com',
                expected: 'the-absolute@protonmail.com',
            },
        ];

        for ( const { email, expected } of cases ) {
            const cleaned = this.clean(email);
            assert.equal(cleaned, expected, `clean_email(${email}) === ${expected}`);
        }
    }
}

module.exports = { CleanEmailService };
