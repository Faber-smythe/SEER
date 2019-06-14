<?php

namespace App\Repository;

use App\Entity\ItemText;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Symfony\Bridge\Doctrine\RegistryInterface;

/**
 * @method ItemText|null find($id, $lockMode = null, $lockVersion = null)
 * @method ItemText|null findOneBy(array $criteria, array $orderBy = null)
 * @method ItemText[]    findAll()
 * @method ItemText[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ItemTextRepository extends ServiceEntityRepository
{
    public function __construct(RegistryInterface $registry)
    {
        parent::__construct($registry, ItemText::class);
    }

    public function findItemTexts($user, $world, $game)
    {
      return $this->createQueryBuilder('it')
        ->andWhere('it.user = :user')
        ->andWhere('it.world = :world')
        ->andWhere('it.game = :game')
        ->setParameters(array('world'=> $world, 'user' => $user, 'game' => $game))
        ->orderBy('it.id', 'ASC')
        ->getQuery()
        ->getResult()
      ;
    }
    public function findItemTextBySlug($user, $world, $game, $slug)
    {
      return $this->createQueryBuilder('it')
        ->andWhere('it.user = :user')
        ->andWhere('it.world = :world')
        ->andWhere('it.game = :game')
        ->andWhere('it.slug = :slug')
        ->setParameters(array('world'=> $world, 'user' => $user, 'game' => $game, 'slug' => $slug))
        ->orderBy('it.id', 'ASC')
        ->getQuery()
        ->getOneOrNullResult()
      ;
    }
    public function findItemTextById($user, $world, $game, $id)
    {
      return $this->createQueryBuilder('it')
        ->andWhere('it.user = :user')
        ->andWhere('it.world = :world')
        ->andWhere('it.game = :game')
        ->andWhere('it.id = :id')
        ->setParameters(array('world'=> $world, 'user' => $user, 'game' => $game, 'id' => $id))
        ->orderBy('it.id', 'ASC')
        ->getQuery()
        ->getOneOrNullResult()
      ;
    }
    // /**
    //  * @return ItemText[] Returns an array of ItemText objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('i')
            ->andWhere('i.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('i.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?ItemText
    {
        return $this->createQueryBuilder('i')
            ->andWhere('i.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
