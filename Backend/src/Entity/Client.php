<?php

declare(strict_types=1);

namespace App\Entity;

final class Client
{
    public function __construct(
        private int $idClient,
        private string $nom,
        private string $ville,
        private string $codePostal,
        private int $rendezVous,
        private int $devis,
        private ?string $dernierContact,
    ) {
    }

    public static function fromRow(array $row): self
    {
        return new self(
            idClient: (int) $row['id_client'],
            nom: trim((string) $row['prenom'] . ' ' . (string) $row['nom']),
            ville: (string) $row['ville'],
            codePostal: (string) $row['code_postal'],
            rendezVous: (int) $row['rendez_vous'],
            devis: (int) $row['devis'],
            dernierContact: $row['dernier_contact'] === null ? null : (string) $row['dernier_contact'],
        );
    }

    public function toArray(): array
    {
        return [
            'id_client' => $this->idClient,
            'nom' => $this->nom,
            'ville' => $this->ville,
            'code_postal' => $this->codePostal,
            'rendez_vous' => $this->rendezVous,
            'devis' => $this->devis,
            'dernier_contact' => $this->dernierContact,
        ];
    }
}
