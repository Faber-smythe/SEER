<?php

namespace App\Repository;

use App\Entity\ItemImage;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Symfony\Bridge\Doctrine\RegistryInterface;

/**
 * @method ItemImage|null find($id, $lockMode = null, $lockVersion = null)
 * @method ItemImage|null findOneBy(array $criteria, array $orderBy = null)
 * @method ItemImage[]    findAll()
 * @method ItemImage[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ItemImageRepository extends ServiceEntityRepository
{
    public function __construct(RegistryInterface $registry)
    {
        parent::__construct($registry, ItemImage::class);
    }

    public function findItemImages($user, $world, $game)
    {
      return $this->createQueryBuilder('ii')
        ->andWhere('ii.user = :user')
        ->andWhere('ii.world = :world')
        ->andWhere('ii.game = :game')
        ->setParameters(array('world'=> $world, 'user' => $user, 'game' => $game))
        ->orderBy('ii.id', 'ASC')
        ->getQuery()
        ->getResult()
      ;
    }
    public function findItemImageBySlug($user, $world, $game, $slug)
    {
      return $this->createQueryBuilder('ii')
        ->andWhere('ii.user = :user')
        ->andWhere('ii.world = :world')
        ->andWhere('ii.game = :game')
        ->andWhere('ii.slug = :slug')
        ->setParameters(array('world'=> $world, 'user' => $user, 'game' => $game, 'slug' => $slug))
        ->orderBy('ii.id', 'ASC')
        ->getQuery()
        ->getOneOrNullResult()
      ;
    }
    public function findItemImageById($user, $world, $game, $id)
    {
      return $this->createQueryBuilder('ii')
        ->andWhere('ii.user = :user')
        ->andWhere('ii.world = :world')
        ->andWhere('ii.game = :game')
        ->andWhere('ii.id = :id')
        ->setParameters(array('world'=> $world, 'user' => $user, 'game' => $game, 'id' => $id))
        ->orderBy('ii.id', 'ASC')
        ->getQuery()
        ->getOneOrNullResult()
      ;
    }

    // /**
    //  * @return ItemImage[] Returns an array of ItemImage objects
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
    public function findOneBySomeField($value): ?ItemImage
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
