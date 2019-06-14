<?php

namespace App\Controller;

use Symfony\Component\Routing\Annotation\Route;
use Twig\Environment;
use Symfony\Component\HttpFoundation\Response;
use Doctrine\Common\Persistence\ObjectManager;
use Symfony\Component\HttpFoundation\Request;
use App\Repository\WorldRepository ;
use App\Repository\GameRepository;
use App\Repository\ItemTextRepository;
use App\Repository\ItemImageRepository;
use App\Form\WorldType ;
use App\Entity\World ;
use App\Entity\User ;
use Cocur\Slugify\Slugify;

class WorldsController extends BaseController
{
  public function __construct(WorldRepository $worldrepository, GameRepository $gamerepository, ItemTextRepository $itemtextrepository, ItemImageRepository $itemimagerepository, ObjectManager $em)
  {
    $this->worldrepository = $worldrepository;
    $this->gamerepository = $gamerepository;
    $this->itemtextrepository = $itemtextrepository;
    $this->itemimagerepository = $itemimagerepository;
    $this->manager = $em;
  }

  // -----------------------
  // SECOND LEVEL PAGES
  // -----------------------
  //  CRUD FOR WORLDS
  //  -display index
  //  -display creating world form and redirect to index
  //  -display editing world form and redirect to index
  //  -processing deleting world and redirect to index

  /**
    * @Route("/worlds", name="worlds.index")
    * @return Response
   */
  public function worlds_index(): Response
  {
    $worlds = $this->worldrepository->findAllWorlds($this->userId());
    return $this->render('worlds/index.html.twig', [
      'worlds' => $worlds,
      'imageFile' => 'imageFile', // that's because you can't use three intricate quote (for inline style inside the template), so the string is sent as variable
      'user' => $this->getUser()->getUsername(),
    ]);
  }

  /**
    * @Route("/new", name="worlds.new")
    * @return Response
   */
  public function worlds_new(Request $request): Response
  {
    $world = new World;
    $world->setUser($this->userId());
    $form = $this->createForm(WorldType::class, $world, array(
            'fileindication' => "max size : 10Mo",
        ));
    $form -> handleRequest($request);

    // If a world has been created, process it
    if($form->isSubmitted() && $form->isValid()) {
        // automatically create the slug for this new world
        $world->setSlug((new Slugify())->slugify($world->getName()));
        // save it
        $this->manager->persist($world);
        $this->manager->flush();
        // redirect to index
        return $this->redirectToRoute('worlds.index');
    }

    // else display the creation form
    return $this->render('worlds/new.html.twig', [
      'form' => $form->createView(),
      'user' => $this->getUser()->getUsername(),
    ]);
  }

  /**
   * @Route("/edit/{slug}", name="worlds.edit")
   * @return Response
   */
  public function worlds_edit($slug, Request $request): Response
  {
    $world = $this->worldrepository->findWorldBySlug($this->userId(), $slug);
    $form = $this->createForm(WorldType::class, $world, array(
        'fileindication' => 'Current file : ' . $world->getFilename() . '(max size : 10Mo)',
    ));
    $form -> handleRequest($request);

    // If a world has been edited, process the changes
    if($form->isSubmitted() && $form->isValid()) {
      // automatically update the slug in case the name changed
      $world->setSlug((new Slugify())->slugify($form->getData()->getName()));
      // save it
      $this->manager->persist($world);
      $this->manager->flush();
      // redirect to index
      return $this->redirectToRoute('worlds.index');
    }

    // else display the edition form
    return $this->render('worlds/edit.html.twig', [
       'form' => $form->createView(),
       'world' => $world,
       'user' => $this->getUser()->getUsername(),
    ]);
  }

  /**
   * @Route("/delete/{id}", name="worlds.delete", methods="DELETE")
   * @param  World      $world     [get the right entity directly through the ID parameter]
   * @return Response
   */
  public function worlds_delete(World $world, Request $request): Response
  {
    // Csrf token prevents from deleting directly via URL
    if($this->isCsrfTokenValid('delete' . $world->getId(), $request->get('_token'))){
      $games_to_delete = $this->gamerepository->findGamesByWorld(
        $this->userId(),
        $world->getId()
      );

      //loop through this world's games
      foreach($games_to_delete as $game){
        //loop through this game's text Items
        $texts = $this->itemtextrepository->findItemTexts(
          $this->userId(),
          $world->getId(),
          $game->getId()
        );
        foreach($texts as $text){
          $this->manager->remove($text);
        }
        //loop through this game's image Items /!\ NOT IMPLEMENTED YET
        $images = $this->itemimagerepository->findItemImages(
          $this->userId(),
          $world->getId(),
          $game->getId()
        );
        foreach($images as $image){
          $this->manager->remove($image);
        }
        $this->manager->remove($game);
      }
      $this->manager->remove($world);

      // delete this world, and the games within, and the items within.
      $this->manager->flush();

      // redirect to index
      return $this->redirectToRoute('worlds.index');
    }

    // if the URL was called without the valid Csrf token.
    return $this->redirectToRoute('worlds.index');
  }
}

?>
